import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  FileCompressionResult 
} from '../interfaces/file.interface';

export interface CompressionResult {
  success: boolean;
  compressedBuffer?: Buffer;
  result?: FileCompressionResult;
  error?: string;
}

export interface ThumbnailResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

export interface WatermarkResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

@Injectable()
export class FileCompressionService {
  private readonly logger = new Logger(FileCompressionService.name);
  private readonly compressionConfig: {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    thumbnailWidth: number;
    thumbnailHeight: number;
  };

  constructor(private configService: ConfigService) {
    this.compressionConfig = {
      quality: this.configService.get<number>('FILE_COMPRESSION_QUALITY', 80),
      maxWidth: this.configService.get<number>('FILE_MAX_WIDTH', 1920),
      maxHeight: this.configService.get<number>('FILE_MAX_HEIGHT', 1080),
      thumbnailWidth: this.configService.get<number>('FILE_THUMBNAIL_WIDTH', 300),
      thumbnailHeight: this.configService.get<number>('FILE_THUMBNAIL_HEIGHT', 300),
    };
  }

  /**
   * Compress image file
   */
  async compressImage(buffer: Buffer, mimeType: string): Promise<CompressionResult> {
    try {
      if (!this.isImageFile(mimeType)) {
        return { success: false, error: 'File is not an image' };
      }

      this.logger.log('Starting image compression', { 
        originalSize: buffer.length, 
        mimeType 
      });

      let compressedBuffer: Buffer;
      let format: string;

      switch (mimeType) {
        case 'image/jpeg':
          compressedBuffer = await this.compressJPEG(buffer);
          format = 'jpeg';
          break;
        case 'image/png':
          compressedBuffer = await this.compressPNG(buffer);
          format = 'png';
          break;
        case 'image/webp':
          compressedBuffer = await this.compressWebP(buffer);
          format = 'webp';
          break;
        default:
          // For other image types, try to convert to JPEG
          compressedBuffer = await this.convertToJPEG(buffer, mimeType);
          format = 'jpeg';
      }

      if (!compressedBuffer) {
        return { success: false, error: 'Compression failed' };
      }

      const compressionRatio = (1 - compressedBuffer.length / buffer.length) * 100;
      
      const result: FileCompressionResult = {
        originalSize: buffer.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        format,
      };

      this.logger.log('Image compression completed', { 
        originalSize: buffer.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: `${result.compressionRatio}%`
      });

      return {
        success: true,
        compressedBuffer,
        result,
      };

    } catch (error) {
      this.logger.error('Error compressing image', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate thumbnail for image
   */
  async generateThumbnail(buffer: Buffer, mimeType: string): Promise<ThumbnailResult> {
    try {
      if (!this.isImageFile(mimeType)) {
        return { success: false, error: 'File is not an image' };
      }

      this.logger.log('Generating thumbnail', { 
        originalSize: buffer.length, 
        mimeType 
      });

      let thumbnailBuffer: Buffer;

      switch (mimeType) {
        case 'image/jpeg':
          thumbnailBuffer = await this.createJPEGThumbnail(buffer);
          break;
        case 'image/png':
          thumbnailBuffer = await this.createPNGThumbnail(buffer);
          break;
        case 'image/webp':
          thumbnailBuffer = await this.createWebPThumbnail(buffer);
          break;
        default:
          // For other image types, convert to JPEG thumbnail
          thumbnailBuffer = await this.createJPEGThumbnail(buffer);
      }

      if (!thumbnailBuffer) {
        return { success: false, error: 'Thumbnail generation failed' };
      }

      this.logger.log('Thumbnail generated successfully', { 
        originalSize: buffer.length,
        thumbnailSize: thumbnailBuffer.length 
      });

      return {
        success: true,
        buffer: thumbnailBuffer,
      };

    } catch (error) {
      this.logger.error('Error generating thumbnail', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add watermark to image
   */
  async addWatermark(buffer: Buffer, mimeType: string, watermarkText?: string): Promise<WatermarkResult> {
    try {
      if (!this.isImageFile(mimeType)) {
        return { success: false, error: 'File is not an image' };
      }

      this.logger.log('Adding watermark to image', { 
        originalSize: buffer.length, 
        mimeType 
      });

      const watermarkTextToUse = watermarkText || this.configService.get<string>('FILE_WATERMARK_TEXT', 'DEVIS EN LIGNE');
      
      let watermarkedBuffer: Buffer;

      switch (mimeType) {
        case 'image/jpeg':
          watermarkedBuffer = await this.addJPEGWatermark(buffer, watermarkTextToUse);
          break;
        case 'image/png':
          watermarkedBuffer = await this.addPNGWatermark(buffer, watermarkTextToUse);
          break;
        case 'image/webp':
          watermarkedBuffer = await this.addWebPWatermark(buffer, watermarkTextToUse);
          break;
        default:
          // For other image types, convert to JPEG and add watermark
          watermarkedBuffer = await this.addJPEGWatermark(buffer, watermarkTextToUse);
      }

      if (!watermarkedBuffer) {
        return { success: false, error: 'Watermark addition failed' };
      }

      this.logger.log('Watermark added successfully', { 
        originalSize: buffer.length,
        watermarkedSize: watermarkedBuffer.length 
      });

      return {
        success: true,
        buffer: watermarkedBuffer,
      };

    } catch (error) {
      this.logger.error('Error adding watermark', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private compression methods

  private async compressJPEG(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Resize if image is too large
      if (metadata.width && metadata.width > this.compressionConfig.maxWidth) {
        image.resize(this.compressionConfig.maxWidth, null, { 
          withoutEnlargement: true 
        });
      }
      
      if (metadata.height && metadata.height > this.compressionConfig.maxHeight) {
        image.resize(null, this.compressionConfig.maxHeight, { 
          withoutEnlargement: true 
        });
      }

      return await image
        .jpeg({ 
          quality: this.compressionConfig.quality,
          progressive: true,
          mozjpeg: true 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error compressing JPEG', { error: error.message });
      return buffer; // Return original if compression fails
    }
  }

  private async compressPNG(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Resize if image is too large
      if (metadata.width && metadata.width > this.compressionConfig.maxWidth) {
        image.resize(this.compressionConfig.maxWidth, null, { 
          withoutEnlargement: true 
        });
      }
      
      if (metadata.height && metadata.height > this.compressionConfig.maxHeight) {
        image.resize(null, this.compressionConfig.maxHeight, { 
          withoutEnlargement: true 
        });
      }

      return await image
        .png({ 
          quality: this.compressionConfig.quality,
          compressionLevel: 9,
          progressive: true 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error compressing PNG', { error: error.message });
      return buffer; // Return original if compression fails
    }
  }

  private async compressWebP(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Resize if image is too large
      if (metadata.width && metadata.width > this.compressionConfig.maxWidth) {
        image.resize(this.compressionConfig.maxWidth, null, { 
          withoutEnlargement: true 
        });
      }
      
      if (metadata.height && metadata.height > this.compressionConfig.maxHeight) {
        image.resize(null, this.compressionConfig.maxHeight, { 
          withoutEnlargement: true 
        });
      }

      return await image
        .webp({ 
          quality: this.compressionConfig.quality,
          effort: 6 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error compressing WebP', { error: error.message });
      return buffer; // Return original if compression fails
    }
  }

  private async convertToJPEG(buffer: Buffer, originalMimeType: string): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Resize if image is too large
      if (metadata.width && metadata.width > this.compressionConfig.maxWidth) {
        image.resize(this.compressionConfig.maxWidth, null, { 
          withoutEnlargement: true 
        });
      }
      
      if (metadata.height && metadata.height > this.compressionConfig.maxHeight) {
        image.resize(null, this.compressionConfig.maxHeight, { 
          withoutEnlargement: true 
        });
      }

      return await image
        .jpeg({ 
          quality: this.compressionConfig.quality,
          progressive: true,
          mozjpeg: true 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error converting to JPEG', { originalMimeType, error: error.message });
      return buffer; // Return original if conversion fails
    }
  }

  // Private thumbnail methods

  private async createJPEGThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      return await sharp(buffer)
        .resize(this.compressionConfig.thumbnailWidth, this.compressionConfig.thumbnailHeight, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error creating JPEG thumbnail', { error: error.message });
      return buffer;
    }
  }

  private async createPNGThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      return await sharp(buffer)
        .resize(this.compressionConfig.thumbnailWidth, this.compressionConfig.thumbnailHeight, {
          fit: 'cover',
          position: 'center'
        })
        .png({ 
          quality: 85,
          compressionLevel: 6 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error creating PNG thumbnail', { error: error.message });
      return buffer;
    }
  }

  private async createWebPThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      return await sharp(buffer)
        .resize(this.compressionConfig.thumbnailWidth, this.compressionConfig.thumbnailHeight, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 85,
          effort: 4 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error creating WebP thumbnail', { error: error.message });
      return buffer;
    }
  }

  // Private watermark methods

  private async addJPEGWatermark(buffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Create watermark text
      const watermark = sharp({
        create: {
          width: metadata.width || 800,
          height: 60,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0.3 }
        }
      })
      .composite([{
        input: Buffer.from(`
          <svg width="${metadata.width || 800}" height="60">
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
              ${watermarkText}
            </text>
          </svg>
        `),
        top: (metadata.height || 600) - 60,
        left: 0
      }]);

      return await image
        .composite([{
          input: await watermark.png().toBuffer(),
          top: 0,
          left: 0
        }])
        .jpeg({ 
          quality: this.compressionConfig.quality,
          progressive: true 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error adding JPEG watermark', { error: error.message });
      return buffer;
    }
  }

  private async addPNGWatermark(buffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Create watermark text
      const watermark = sharp({
        create: {
          width: metadata.width || 800,
          height: 60,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0.3 }
        }
      })
      .composite([{
        input: Buffer.from(`
          <svg width="${metadata.width || 800}" height="60">
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
              ${watermarkText}
            </text>
          </svg>
        `),
        top: (metadata.height || 600) - 60,
        left: 0
      }]);

      return await image
        .composite([{
          input: await watermark.png().toBuffer(),
          top: 0,
          left: 0
        }])
        .png({ 
          quality: this.compressionConfig.quality,
          compressionLevel: 6 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error adding PNG watermark', { error: error.message });
      return buffer;
    }
  }

  private async addWebPWatermark(buffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const sharp = require('sharp');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Create watermark text
      const watermark = sharp({
        create: {
          width: metadata.width || 800,
          height: 60,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0.3 }
        }
      })
      .composite([{
        input: Buffer.from(`
          <svg width="${metadata.width || 800}" height="60">
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
              ${watermarkText}
            </text>
          </svg>
        `),
        top: (metadata.height || 600) - 60,
        left: 0
      }]);

      return await image
        .composite([{
          input: await watermark.png().toBuffer(),
          top: 0,
          left: 0
        }])
        .webp({ 
          quality: this.compressionConfig.quality,
          effort: 4 
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error adding WebP watermark', { error: error.message });
      return buffer;
    }
  }

  // Helper methods

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}
