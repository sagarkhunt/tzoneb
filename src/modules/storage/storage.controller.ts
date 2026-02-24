import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const url = await this.storageService.upload(file);
    return { url, message: 'File uploaded successfully' };
  }

  @Get('files')
  @ApiOperation({ summary: 'List all files' })
  @ApiResponse({ status: 200, description: 'Return list of files' })
  async listFiles() {
    const files = await this.storageService.listFiles();
    return { files };
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('filename') filename: string) {
    await this.storageService.delete(filename);
    return { message: 'File deleted successfully' };
  }

  @Get('signed-url/:filename')
  @ApiOperation({ summary: 'Get signed URL for file' })
  @ApiResponse({ status: 200, description: 'Return signed URL' })
  async getSignedUrl(@Param('filename') filename: string) {
    const url = await this.storageService.getSignedUrl(filename);
    return { url };
  }
}
