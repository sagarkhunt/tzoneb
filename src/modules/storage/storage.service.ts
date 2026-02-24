import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private containerClient: ContainerClient | null = null;
  private provider: string;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<string>('storage.provider') || 'azure';
    
    if (this.provider === 'azure') {
      this.initializeAzureStorage();
    }
    // For S3, implement similar initialization
  }

  private initializeAzureStorage() {
    const connectionString = this.configService.get<string>('storage.azure.connectionString');
    const containerName = this.configService.get<string>('storage.azure.containerName') || 'uploads';

    if (!connectionString) {
      this.logger.warn('Azure Storage connection string not configured');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = blobServiceClient.getContainerClient(containerName);
      this.logger.log('Azure Blob Storage initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Azure Blob Storage', error);
    }
  }

  async upload(file: Express.Multer.File, path?: string): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Storage not initialized');
    }

    const blobName = path || `${Date.now()}-${file.originalname}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    this.logger.log(`File uploaded: ${blobName}`);
    return blockBlobClient.url;
  }

  async download(blobName: string): Promise<Buffer> {
    if (!this.containerClient) {
      throw new Error('Storage not initialized');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download();
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('Failed to download file: no readable stream');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  async delete(blobName: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error('Storage not initialized');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    this.logger.log(`File deleted: ${blobName}`);
  }

  async getSignedUrl(blobName: string, expiresInMinutes = 60): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Storage not initialized');
    }

    // Implement SAS token generation for Azure or pre-signed URL for S3
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  async listFiles(prefix?: string): Promise<string[]> {
    if (!this.containerClient) {
      throw new Error('Storage not initialized');
    }

    const fileNames: string[] = [];
    const iterator = this.containerClient.listBlobsFlat({ prefix });

    for await (const blob of iterator) {
      fileNames.push(blob.name);
    }

    return fileNames;
  }
}
