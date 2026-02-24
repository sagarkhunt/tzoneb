import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { message: string; timestamp: string } {
    return {
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    };
  }
}
