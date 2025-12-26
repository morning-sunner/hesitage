const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * 邮件服务
 */
class EmailService {
  constructor() {
    // 初始化 SMTP 传输
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * 发送验证码邮件（注册）
   */
  async sendRegisterCode(email, code) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: '长三角非遗平台 - 注册验证码',
        text: `欢迎注册长三角非遗平台\n\n您的注册验证码是：${code}\n\n验证码有效期为 10 分钟，请勿泄露给他人。\n\n如果您没有进行此操作，请忽略此邮件。`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b6f47;">欢迎注册长三角非遗平台</h2>
            <p>您的注册验证码是：</p>
            <div style="background: #f5e6d3; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #c9916f; letter-spacing: 5px;">${code}</h1>
            </div>
            <p style="color: #666;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
            <p style="color: #999; font-size: 12px;">如果您没有进行此操作，请忽略此邮件。</p>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✓ 注册验证码邮件已发送:', result.messageId);
      console.log(`   📧 邮箱: ${email}`);
      console.log(`   🔐 验证码: ${code}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ 发送邮件失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送验证码邮件（密码重置）
   */
  async sendResetCode(email, code) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: '长三角非遗平台 - 密码重置验证码',
        text: `亲爱的用户\n\n您的密码重置验证码是：${code}\n\n验证码有效期为 10 分钟，请勿泄露给他人。\n\n如果您没有进行此操作，请忽略此邮件。`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b6f47;">密码重置请求</h2>
            <p>我们收到了您的密码重置请求。</p>
            <p>您的验证码是：</p>
            <div style="background: #f5e6d3; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #c9916f; letter-spacing: 5px;">${code}</h1>
            </div>
            <p style="color: #666;">验证码有效期为 10 分钟。</p>
            <p style="color: #999; font-size: 12px;">如果您没有进行此操作，请忽略此邮件，您的账户是安全的。</p>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✓ 密码重置验证码邮件已发送:', result.messageId);
      console.log(`   📧 邮箱: ${email}`);
      console.log(`   🔐 验证码: ${code}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ 发送邮件失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试邮件连接
   */
  async testConnection() {
    try {
      const result = await this.transporter.verify();
      if (result) {
        console.log('✓ SMTP 邮件服务连接成功');
        return { success: true, message: 'SMTP 连接成功' };
      }
    } catch (error) {
      console.error('❌ SMTP 邮件服务连接失败:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
