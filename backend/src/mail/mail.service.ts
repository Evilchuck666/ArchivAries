import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}

  async sendInvite(
    email: string,
    activationUrl: string,
    expiresHours: number,
  ): Promise<void> {
    const host = this.config.get<string>('smtp.host');

    if (!host) {
      console.log(
        `\n[INVITE] ${email}\n  Activation URL: ${activationUrl}\n  Expires in: ${expiresHours}h\n`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('smtp.port'),
      auth: {
        user: this.config.get<string>('smtp.user'),
        pass: this.config.get<string>('smtp.pass'),
      },
    });

    try {
      await transporter.sendMail({
        from: this.config.get<string>('smtp.from'),
        to: email,
        subject: 'Activación de tu cuenta en ArchivAries',
        text: `Has sido invitado a unirte a ArchivAries.\n\nActiva tu cuenta aquí:\n${activationUrl}\n\nEl enlace caduca en ${expiresHours} horas.`,
        html: `
          <p>Has sido invitado a unirte a <strong>ArchivAries</strong>.</p>
          <p><a href="${activationUrl}">Activar mi cuenta</a></p>
          <p><small>Este enlace caduca en ${expiresHours} horas.</small></p>
        `,
      });
    } catch (err) {
      console.error(`[MAIL ERROR] Failed to send invite to ${email}:`, err);
      console.log(`[INVITE FALLBACK] ${email}\n  Activation URL: ${activationUrl}`);
    }
  }
}
