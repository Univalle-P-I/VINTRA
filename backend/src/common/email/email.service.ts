import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_SERVER');
    const port = Number(config.get<string>('SMTP_PORT', '587'));
    const user = config.get<string>('EMAIL_USER');
    const pass = config.get<string>('EMAIL_PASS');

    this.configured = Boolean(host && user && pass && Number.isInteger(port) && port > 0);
    this.from = config.get<string>('EMAIL_FROM', user ?? '');
    this.transporter = nodemailer.createTransport({
      host: host || 'localhost',
      port: Number.isInteger(port) && port > 0 ? port : 587,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

}