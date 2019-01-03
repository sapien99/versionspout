import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [],
  exports: [
    MailService,
  ],
  controllers: [],
  providers: [
    MailService,
  ],  
})

export class MailModule {}
