import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@database/prisma.service';

@Processor('cleanup')
export class CleanupProcessor {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('expired-tokens')
  async handleExpiredTokensCleanup(job: Job) {
    this.logger.log(`Processing cleanup job ${job.id}: expired tokens`);

    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
      return { success: true, deletedCount: result.count };
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens', error);
      throw error;
    }
  }

  @Process('old-logs')
  async handleOldLogsCleanup(job: Job) {
    this.logger.log(`Processing cleanup job ${job.id}: old logs`);

    try {
      // Implement log cleanup logic here
      // For example, delete logs older than 30 days
      this.logger.log('Old logs cleanup completed');
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to cleanup old logs', error);
      throw error;
    }
  }
}
