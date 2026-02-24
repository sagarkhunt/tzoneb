import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 'azure', // 'azure' or 's3'
  
  // Azure Blob Storage
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_STORAGE_CONTAINER || 'uploads',
  },
  
  // AWS S3
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_BUCKET || 'uploads',
  },
}));
