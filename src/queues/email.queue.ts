import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);
    const { to, subject, body } = job.data;

    try {
      // Implement actual email sending logic here
      // For now, just log it
      this.logger.log(`Sending email to ${to}: ${subject}`);
      
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, to, subject };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
