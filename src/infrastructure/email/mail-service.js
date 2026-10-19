import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { logger } from '../logging/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MailService {
  constructor() {
    this.transporter = null;
    this.templatesDir = path.resolve(__dirname, 'templates');
    this.from = process.env.MAIL_FROM || 'HelpDesk <noreply@helpdesk.com>';
  }

  getTransporter() {
    if (!this.transporter) {
      const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      };

      this.transporter = nodemailer.createTransport(config);
    }

    return this.transporter;
  }

  async compileTemplate(templateName, variables) {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiled = handlebars.compile(templateContent);
    return compiled(variables);
  }

  async sendMail({ to, subject, template, variables }) {
    try {
      const html = await this.compileTemplate(template, variables);
      const transporter = this.getTransporter();

      return await transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        recipient: to,
        template,
        error: error.message,
      });
      throw error;
    }
  }
}

export const mailService = new MailService();
