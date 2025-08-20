import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { StorageProvider } from '../interfaces/storage.interface';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'pdf-storage');
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      endpoint: this.configService.get<string>('AWS_S3_ENDPOINT'),
      forcePathStyle: this.configService.get<boolean>('AWS_S3_FORCE_PATH_STYLE', false),
    });

    this.logger.log('S3 storage provider initialized', { bucket: this.bucket, region: this.region });
  }

  async storeFile(filename: string, buffer: Buffer, metadata?: Record<string, any>): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: 'application/pdf',
        Metadata: metadata,
        ACL: 'private',
      });

      await this.s3Client.send(command);

      this.logger.log('File stored successfully in S3', { filename, size: buffer.length });
      return filename;
    } catch (error) {
      this.logger.error('Error storing file in S3', { filename, error: error.message });
      throw new Error(`Failed to store file in S3: ${error.message}`);
    }
  }

  async getFile(filename: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error('Error retrieving file from S3', { filename, error: error.message });
      throw new Error(`Failed to retrieve file from S3: ${error.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      await this.s3Client.send(command);

      this.logger.log('File deleted successfully from S3', { filename });
    } catch (error) {
      this.logger.error('Error deleting file from S3', { filename, error: error.message });
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error('Error checking file existence in S3', { filename, error: error.message });
      throw new Error(`Failed to check file existence in S3: ${error.message}`);
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    try {
      // Generate presigned URL for temporary access
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
      return url;
    } catch (error) {
      this.logger.error('Error generating file URL from S3', { filename, error: error.message });
      throw new Error(`Failed to generate file URL from S3: ${error.message}`);
    }
  }

  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      return response.Contents.map(obj => obj.Key).filter(Boolean) as string[];
    } catch (error) {
      this.logger.error('Error listing files from S3', { prefix, error: error.message });
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(filename: string): Promise<Record<string, any> | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      const response = await this.s3Client.send(command);
      
      return {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata,
        etag: response.ETag,
      };
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      this.logger.error('Error getting file metadata from S3', { filename, error: error.message });
      throw new Error(`Failed to get file metadata from S3: ${error.message}`);
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const { CopyObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
        ACL: 'private',
      });

      await this.s3Client.send(command);

      this.logger.log('File copied successfully in S3', { sourceKey, destinationKey });
    } catch (error) {
      this.logger.error('Error copying file in S3', { sourceKey, destinationKey, error: error.message });
      throw new Error(`Failed to copy file in S3: ${error.message}`);
    }
  }
}
