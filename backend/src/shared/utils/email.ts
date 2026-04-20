import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import type { EmailOptions, BookingEmailData } from '../types/index.js';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to send email');
  }
}

export function generateBookingConfirmationEmail(data: BookingEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Бронирование подтверждено!</h1>
        </div>
        <div class="content">
          <p>Здравствуйте, ${escapeHtml(data.userName)}!</p>
          <p>Ваше бронирование в Термбург успешно оформлено.</p>

          <div class="booking-details">
            <h2>Детали бронирования</h2>
            <div class="detail-row">
              <span class="detail-label">ID бронирования:</span>
              <span>${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Услуга:</span>
              <span>${escapeHtml(data.serviceName)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата:</span>
              <span>${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Время:</span>
              <span>${data.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Стоимость:</span>
              <span><strong>${data.totalPrice} ₽</strong></span>
            </div>
          </div>

          <p>Ждем вас в указанное время. Если у вас есть вопросы, свяжитесь с нами по телефону или email.</p>

          <div class="footer">
            <p>С уважением,<br>Команда Термбург</p>
            <p style="font-size: 12px;">Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWelcomeEmail(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Добро пожаловать в Термбург!</h1>
        </div>
        <div class="content">
          <p>Здравствуйте, ${escapeHtml(userName)}!</p>
          <p>Спасибо за регистрацию на нашем сайте. Теперь вы можете:</p>
          <ul>
            <li>Бронировать услуги онлайн</li>
            <li>Просматривать историю посещений</li>
            <li>Получать специальные предложения</li>
            <li>Участвовать в программе лояльности</li>
          </ul>
          <p>С уважением,<br>Команда Термбург</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
