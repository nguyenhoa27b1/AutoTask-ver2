import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  // Task created notification
  async sendTaskCreatedEmail(userEmail: string, userName: string, taskTitle: string, deadline: Date): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎯 Bạn có công việc mới!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Bạn vừa được giao một công việc mới:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tiêu đề:</strong> ${taskTitle}</p>
          <p><strong>Hạn nộp:</strong> ${deadline.toLocaleString('vi-VN')}</p>
        </div>
        <p>Vui lòng truy cập hệ thống để xem chi tiết và hoàn thành công việc đúng hạn.</p>
        <a href="${config.frontend.url}/tasks" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Xem chi tiết
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">AutoTask System - Hệ thống quản lý công việc</p>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: `🎯 Công việc mới: ${taskTitle}`,
      html,
    });
  }

  // Task completed notification
  async sendTaskCompletedEmail(userEmail: string, userName: string, taskTitle: string, score: number): Promise<void> {
    const scoreEmoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '📝';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">${scoreEmoji} Công việc đã được chấm điểm!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Công việc của bạn đã được Admin đánh giá:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tiêu đề:</strong> ${taskTitle}</p>
          <p><strong>Điểm số:</strong> <span style="font-size: 24px; color: ${score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'};">${score}/100</span></p>
        </div>
        <a href="${config.frontend.url}/tasks" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Xem chi tiết
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">AutoTask System - Hệ thống quản lý công việc</p>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: `${scoreEmoji} Công việc được chấm điểm: ${taskTitle}`,
      html,
    });
  }

  // Task deadline reminder
  async sendDeadlineReminderEmail(userEmail: string, userName: string, taskTitle: string, deadline: Date): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">⏰ Nhắc nhở: Công việc sắp đến hạn!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Công việc của bạn sắp đến hạn nộp:</p>
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800;">
          <p><strong>Tiêu đề:</strong> ${taskTitle}</p>
          <p><strong>Hạn nộp:</strong> <span style="color: #F44336; font-weight: bold;">${deadline.toLocaleString('vi-VN')}</span></p>
        </div>
        <p>Vui lòng hoàn thành công việc đúng hạn để đạt được điểm số tốt nhất!</p>
        <a href="${config.frontend.url}/tasks" style="display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Xem chi tiết
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">AutoTask System - Hệ thống quản lý công việc</p>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: `⏰ Nhắc nhở: ${taskTitle} sắp đến hạn!`,
      html,
    });
  }

  // Task deleted notification
  async sendTaskDeletedEmail(userEmail: string, userName: string, taskTitle: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F44336;">🗑️ Công việc đã bị xóa</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Thông báo: Công việc sau đã bị Admin xóa khỏi hệ thống:</p>
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #F44336;">
          <p><strong>Tiêu đề:</strong> ${taskTitle}</p>
        </div>
        <p>Nếu có thắc mắc, vui lòng liên hệ với Admin.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">AutoTask System - Hệ thống quản lý công việc</p>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: `🗑️ Công việc bị xóa: ${taskTitle}`,
      html,
    });
  }
}

export default new EmailService();
