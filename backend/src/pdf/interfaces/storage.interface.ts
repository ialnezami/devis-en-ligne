export interface StorageProvider {
  storeFile(filename: string, buffer: Buffer, metadata?: Record<string, any>): Promise<string>;
  getFile(filename: string): Promise<Buffer>;
  deleteFile(filename: string): Promise<void>;
  fileExists(filename: string): Promise<boolean>;
  getFileUrl(filename: string): Promise<string>;
  listFiles(prefix?: string): Promise<string[]>;
}

export interface StorageConfig {
  provider: 'local' | 's3';
  local?: {
    basePath: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
}
