import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface SecurityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  scanDetails?: {
    virusScanned: boolean;
    contentValidated: boolean;
    encrypted: boolean;
    checksum: string;
  };
}

export interface EncryptionResult {
  success: boolean;
  encryptedBuffer?: Buffer;
  error?: string;
  algorithm?: string;
  iv?: Buffer;
}

export interface DecryptionResult {
  success: boolean;
  decryptedBuffer?: Buffer;
  error?: string;
}

@Injectable()
export class FileSecurityService {
  private readonly logger = new Logger(FileSecurityService.name);
  private readonly securityConfig: {
    virusScanning: boolean;
    contentValidation: boolean;
    encryptionRequired: boolean;
    encryptionAlgorithm: string;
    encryptionKey: string;
    maxFileSize: number;
    blockedExtensions: string[];
    suspiciousPatterns: RegExp[];
  };

  constructor(private configService: ConfigService) {
    this.securityConfig = {
      virusScanning: this.configService.get<boolean>('FILE_VIRUS_SCANNING', true),
      contentValidation: this.configService.get<boolean>('FILE_CONTENT_VALIDATION', true),
      encryptionRequired: this.configService.get<boolean>('FILE_ENCRYPTION_REQUIRED', false),
      encryptionAlgorithm: this.configService.get<string>('FILE_ENCRYPTION_ALGORITHM', 'aes-256-gcm'),
      encryptionKey: this.configService.get<string>('FILE_ENCRYPTION_KEY', ''),
      maxFileSize: this.configService.get<number>('FILE_MAX_SIZE', 50 * 1024 * 1024),
      blockedExtensions: this.configService.get<string[]>('FILE_BLOCKED_EXTENSIONS', [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.msi', '.dll'
      ]),
      suspiciousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /document\./gi,
        /window\./gi,
        /ActiveXObject/gi,
        /WScript\./gi,
        /Shell\./gi,
        /RegExp/gi,
        /Function\s*\(/gi,
      ],
    };
  }

  /**
   * Perform comprehensive security checks on a file
   */
  async performSecurityChecks(file: Express.Multer.File): Promise<SecurityCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let virusScanned = false;
    let contentValidated = false;
    let encrypted = false;

    try {
      this.logger.log('Starting security checks for file', { 
        filename: file.originalname, 
        size: file.size,
        mimeType: file.mimetype 
      });

      // 1. Basic file size check
      if (file.size > this.securityConfig.maxFileSize) {
        errors.push(`File size ${file.size} bytes exceeds maximum allowed size of ${this.securityConfig.maxFileSize} bytes`);
      }

      // 2. File extension check
      const extension = this.getFileExtension(file.originalname);
      if (this.securityConfig.blockedExtensions.includes(extension.toLowerCase())) {
        errors.push(`File extension ${extension} is blocked for security reasons`);
      }

      // 3. MIME type validation
      const mimeTypeCheck = this.validateMimeType(file.mimetype, extension);
      if (!mimeTypeCheck.isValid) {
        errors.push(mimeTypeCheck.error);
      }

      // 4. Content validation
      if (this.securityConfig.contentValidation) {
        const contentCheck = await this.validateFileContent(file);
        if (!contentCheck.isValid) {
          errors.push(...contentCheck.errors);
        }
        contentValidated = true;
      }

      // 5. Virus scanning (if enabled)
      if (this.securityConfig.virusScanning) {
        const virusCheck = await this.scanForViruses(file);
        if (!virusCheck.passed) {
          errors.push(...virusCheck.errors);
        }
        virusScanned = true;
      }

      // 6. Check for suspicious patterns in text files
      if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
        const patternCheck = this.checkSuspiciousPatterns(file.buffer);
        if (patternCheck.found) {
          warnings.push(`File contains potentially suspicious patterns: ${patternCheck.patterns.join(', ')}`);
        }
      }

      // 7. File header validation
      const headerCheck = this.validateFileHeader(file.buffer, file.mimetype);
      if (!headerCheck.isValid) {
        errors.push(headerCheck.error);
      }

      // 8. Entropy analysis for potential encrypted/compressed files
      const entropyAnalysis = this.analyzeFileEntropy(file.buffer);
      if (entropyAnalysis.highEntropy && !this.isExpectedHighEntropyFile(file.mimetype)) {
        warnings.push('File has unusually high entropy, which may indicate encryption or compression');
      }

      const passed = errors.length === 0;
      
      if (passed) {
        this.logger.log('Security checks passed for file', { filename: file.originalname });
      } else {
        this.logger.warn('Security checks failed for file', { 
          filename: file.originalname, 
          errors 
        });
      }

      return {
        passed,
        errors,
        warnings,
        scanDetails: {
          virusScanned,
          contentValidated,
          encrypted,
          checksum: this.calculateChecksum(file.buffer),
        },
      };

    } catch (error) {
      this.logger.error('Error during security checks', { 
        filename: file.originalname, 
        error: error.message 
      });
      
      errors.push(`Security check error: ${error.message}`);
      
      return {
        passed: false,
        errors,
        warnings,
        scanDetails: {
          virusScanned,
          contentValidated,
          encrypted,
          checksum: this.calculateChecksum(file.buffer),
        },
      };
    }
  }

  /**
   * Encrypt a file
   */
  async encryptFile(buffer: Buffer): Promise<EncryptionResult> {
    try {
      if (!this.securityConfig.encryptionKey) {
        return { success: false, error: 'Encryption key not configured' };
      }

      this.logger.log('Encrypting file', { size: buffer.length });

      const algorithm = this.securityConfig.encryptionAlgorithm;
      const key = crypto.scryptSync(this.securityConfig.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      let cipher: crypto.Cipher;
      
      if (algorithm === 'aes-256-gcm') {
        cipher = crypto.createCipher(algorithm, key);
      } else {
        cipher = crypto.createCipher(algorithm, key, iv);
      }

      const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ]);

      let encryptedBuffer: Buffer;
      
      if (algorithm === 'aes-256-gcm') {
        const authTag = (cipher as any).getAuthTag();
        encryptedBuffer = Buffer.concat([iv, authTag, encrypted]);
      } else {
        encryptedBuffer = Buffer.concat([iv, encrypted]);
      }

      this.logger.log('File encrypted successfully', { 
        originalSize: buffer.length,
        encryptedSize: encryptedBuffer.length 
      });

      return {
        success: true,
        encryptedBuffer,
        algorithm,
        iv,
      };

    } catch (error) {
      this.logger.error('Error encrypting file', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Decrypt a file
   */
  async decryptFile(buffer: Buffer, algorithm?: string): Promise<DecryptionResult> {
    try {
      if (!this.securityConfig.encryptionKey) {
        return { success: false, error: 'Encryption key not configured' };
      }

      this.logger.log('Decrypting file', { size: buffer.length });

      const algo = algorithm || this.securityConfig.encryptionAlgorithm;
      const key = crypto.scryptSync(this.securityConfig.encryptionKey, 'salt', 32);

      let decryptedBuffer: Buffer;
      
      if (algo === 'aes-256-gcm') {
        const iv = buffer.slice(0, 16);
        const authTag = buffer.slice(16, 32);
        const encrypted = buffer.slice(32);
        
        const decipher = crypto.createDecipher(algo, key);
        (decipher as any).setAuthTag(authTag);
        
        decryptedBuffer = Buffer.concat([
          decipher.update(encrypted),
          decipher.final()
        ]);
      } else {
        const iv = buffer.slice(0, 16);
        const encrypted = buffer.slice(16);
        
        const decipher = crypto.createDecipher(algo, key, iv);
        decryptedBuffer = Buffer.concat([
          decipher.update(encrypted),
          decipher.final()
        ]);
      }

      this.logger.log('File decrypted successfully', { 
        encryptedSize: buffer.length,
        decryptedSize: decryptedBuffer.length 
      });

      return {
        success: true,
        decryptedBuffer,
      };

    } catch (error) {
      this.logger.error('Error decrypting file', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private validation methods

  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  private validateMimeType(mimeType: string, extension: string): { isValid: boolean; error?: string } {
    // Basic MIME type validation
    const validMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'text/html', 'application/json',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];

    if (!validMimeTypes.includes(mimeType)) {
      return { isValid: false, error: `MIME type ${mimeType} is not allowed` };
    }

    return { isValid: true };
  }

  private async validateFileContent(file: Express.Multer.File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check file header for common file types
      const header = file.buffer.slice(0, 8);
      
      if (file.mimetype === 'image/jpeg' && !this.isValidJPEGHeader(header)) {
        errors.push('Invalid JPEG file header');
      }
      
      if (file.mimetype === 'image/png' && !this.isValidPNGHeader(header)) {
        errors.push('Invalid PNG file header');
      }
      
      if (file.mimetype === 'application/pdf' && !this.isValidPDFHeader(header)) {
        errors.push('Invalid PDF file header');
      }

      // Check for executable content in text files
      if (file.mimetype.startsWith('text/') && this.containsExecutableContent(file.buffer)) {
        errors.push('File contains potentially executable content');
      }

      // Check for null bytes (common in binary files)
      if (file.mimetype.startsWith('text/') && file.buffer.includes(0)) {
        errors.push('Text file contains null bytes, which may indicate binary content');
      }

    } catch (error) {
      errors.push('Unable to validate file content');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async scanForViruses(file: Express.Multer.File): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // This is a placeholder for actual virus scanning
      // In production, you would integrate with a virus scanning service like:
      // - ClamAV
      // - VirusTotal API
      // - AWS GuardDuty
      // - Custom ML-based detection

      // For now, we'll do basic heuristic checks
      const suspiciousIndicators = this.checkSuspiciousIndicators(file);
      
      if (suspiciousIndicators.length > 0) {
        errors.push(`Potential security threats detected: ${suspiciousIndicators.join(', ')}`);
      }

      // Simulate virus scanning delay
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      errors.push(`Virus scanning failed: ${error.message}`);
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }

  private checkSuspiciousIndicators(file: Express.Multer.File): string[] {
    const indicators: string[] = [];

    // Check for suspicious file names
    const suspiciousNames = ['virus', 'malware', 'trojan', 'backdoor', 'keylogger'];
    const filename = file.originalname.toLowerCase();
    
    if (suspiciousNames.some(name => filename.includes(name))) {
      indicators.push('Suspicious filename');
    }

    // Check for files with double extensions (e.g., document.pdf.exe)
    const extensions = file.originalname.split('.');
    if (extensions.length > 2) {
      const lastExtension = extensions[extensions.length - 1].toLowerCase();
      if (['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'].includes(lastExtension)) {
        indicators.push('Double extension with executable file type');
      }
    }

    // Check for files that are too small for their type
    if (file.mimetype.startsWith('image/') && file.size < 100) {
      indicators.push('Image file is suspiciously small');
    }

    // Check for files that are too large for their type
    if (file.mimetype === 'text/plain' && file.size > 10 * 1024 * 1024) {
      indicators.push('Text file is suspiciously large');
    }

    return indicators;
  }

  private checkSuspiciousPatterns(buffer: Buffer): { found: boolean; patterns: string[] } {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    const foundPatterns: string[] = [];

    for (const pattern of this.securityConfig.suspiciousPatterns) {
      if (pattern.test(content)) {
        foundPatterns.push(pattern.source);
      }
    }

    return {
      found: foundPatterns.length > 0,
      patterns: foundPatterns,
    };
  }

  private validateFileHeader(buffer: Buffer, mimeType: string): { isValid: boolean; error?: string } {
    try {
      const header = buffer.slice(0, 8);
      
      switch (mimeType) {
        case 'image/jpeg':
          return { isValid: this.isValidJPEGHeader(header) };
        case 'image/png':
          return { isValid: this.isValidPNGHeader(header) };
        case 'application/pdf':
          return { isValid: this.isValidPDFHeader(header) };
        case 'image/gif':
          return { isValid: this.isValidGIFHeader(header) };
        case 'image/webp':
          return { isValid: this.isValidWebPHeader(header) };
        default:
          return { isValid: true }; // Skip validation for unknown types
      }
    } catch (error) {
      return { isValid: false, error: 'Header validation failed' };
    }
  }

  private analyzeFileEntropy(buffer: Buffer): { highEntropy: boolean; entropy: number } {
    try {
      // Calculate Shannon entropy
      const byteCounts = new Array(256).fill(0);
      for (let i = 0; i < buffer.length; i++) {
        byteCounts[buffer[i]]++;
      }

      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (byteCounts[i] > 0) {
          const probability = byteCounts[i] / buffer.length;
          entropy -= probability * Math.log2(probability);
        }
      }

      // High entropy typically indicates encrypted or compressed content
      const highEntropy = entropy > 7.5;
      
      return { highEntropy, entropy };
    } catch (error) {
      return { highEntropy: false, entropy: 0 };
    }
  }

  private isExpectedHighEntropyFile(mimeType: string): boolean {
    const highEntropyTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    return highEntropyTypes.includes(mimeType);
  }

  // File header validation methods

  private isValidJPEGHeader(header: Buffer): boolean {
    return header[0] === 0xFF && header[1] === 0xD8;
  }

  private isValidPNGHeader(header: Buffer): boolean {
    return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  }

  private isValidPDFHeader(header: Buffer): boolean {
    const headerStr = header.toString('ascii', 0, 4);
    return headerStr === '%PDF';
  }

  private isValidGIFHeader(header: Buffer): boolean {
    const headerStr = header.toString('ascii', 0, 6);
    return headerStr === 'GIF87a' || headerStr === 'GIF89a';
  }

  private isValidWebPHeader(header: Buffer): boolean {
    const headerStr = header.toString('ascii', 0, 4);
    return headerStr === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
  }

  private containsExecutableContent(buffer: Buffer): boolean {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
    const executablePatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /document\./gi,
      /window\./gi,
      /ActiveXObject/gi,
      /WScript\./gi,
      /Shell\./gi,
    ];
    
    return executablePatterns.some(pattern => pattern.test(content));
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
