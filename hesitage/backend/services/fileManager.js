const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * 文件存储管理器
 * 支持本地存储和服务器(SSH)存储两种模式
 */
class FileManager {
  constructor() {
    const storageMode = process.env.STORAGE_MODE || 'local';
    
    if (storageMode === 'local') {
      // 本地模式：存储在项目的 public/uploads 目录
      this.uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'images');
      this.urlPrefix = '/uploads/images';
      this.mode = 'local';
      console.log('📁 存储模式: 本地');
    } else {
      // 服务器模式：使用SSH上传到服务器
      this.serverHost = process.env.SERVER_HOST;
      this.serverPort = process.env.SERVER_PORT || 22;
      this.serverUser = process.env.SERVER_USER;
      this.useKey = process.env.SERVER_USE_KEY === 'true';
      this.serverPassword = process.env.SERVER_PASSWORD;
      
      this.serverUploadsDir = process.env.SERVER_UPLOADS_DIR;
      this.serverAccessUrl = process.env.SERVER_ACCESS_URL;
      this.urlPrefix = process.env.SERVER_UPLOADS_URL_PREFIX;
      this.mode = 'server';
      
      console.log('🌐 存储模式: 服务器(SSH)');
      console.log(`📂 服务器地址: ${this.serverUser}@${this.serverHost}:${this.serverPort}`);
      console.log(`📁 存储目录: ${this.serverUploadsDir}`);
      console.log(`🔗 访问地址: ${this.serverAccessUrl}${this.urlPrefix}`);
      
      // 验证服务器连接
      this.verifyServerConnection();
    }
  }

  /**
   * 验证服务器SSH连接
   */
  verifyServerConnection() {
    try {
      const sshCmd = this.buildSSHCommand('echo "SSH connection OK"');
      console.log('🔐 验证服务器SSH连接...');
      execSync(sshCmd, { stdio: 'pipe' });
      console.log('✅ SSH连接成功');
    } catch (error) {
      console.error('❌ SSH连接失败:', error.message);
      console.error('请确保：');
      console.error('1. 服务器地址正确: ' + this.serverHost);
      console.error('2. SSH密钥已正确配置（若使用免密连接）');
      console.error('3. 防火墙允许SSH连接（端口 ' + this.serverPort + '）');
    }
  }

  /**
   * 构建SSH命令
   */
  buildSSHCommand(remoteCommand) {
    const host = `${this.serverUser}@${this.serverHost}`;
    const portOption = `-p ${this.serverPort}`;
    
    // SSH选项：禁用主机密钥检查（自动接受新主机）
    const sshOptions = `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes`;
    
    let sshCmd;
    if (this.useKey) {
      // 使用密钥认证
      sshCmd = `ssh ${sshOptions} ${portOption} ${host} "${remoteCommand}"`;
    } else {
      // 使用密码认证
      if (!this.serverPassword) {
        throw new Error('使用密码认证但未设置SERVER_PASSWORD');
      }
      sshCmd = `sshpass -p "${this.serverPassword}" ssh ${sshOptions} ${portOption} ${host} "${remoteCommand}"`;
    }
    
    return sshCmd;
  }

  /**
   * 生成唯一的文件名
   */
  generateFileName(originalFileName) {
    const ext = path.extname(originalFileName);
    const timestamp = Date.now();
    const uuid = uuidv4();
    return `${uuid}-${timestamp}${ext}`;
  }

  /**
   * 本地复制文件
   */
  copyFile(sourcePath, originalFileName) {
    try {
      const newFileName = this.generateFileName(originalFileName);
      const destPath = path.join(this.uploadsDir, newFileName);
      
      fs.copyFileSync(sourcePath, destPath);
      
      return {
        relativePath: `${this.urlPrefix}/${newFileName}`,
        absolutePath: destPath,
        fileName: newFileName
      };
    } catch (error) {
      console.error('复制文件失败:', error);
      throw error;
    }
  }

  /**
   * 上传文件到服务器
   */
  uploadFileToServer(sourcePath, originalFileName) {
    try {
      const newFileName = this.generateFileName(originalFileName);
      const remoteFilePath = `${this.serverUploadsDir}/${newFileName}`;
      
      // 1. 确保服务器目录存在
      const mkdirCmd = this.buildSSHCommand(`mkdir -p ${this.serverUploadsDir}`);
      execSync(mkdirCmd, { stdio: 'pipe' });
      console.log(`✅ 服务器目录就绪: ${this.serverUploadsDir}`);
      
      // 2. 上传文件到服务器
      const host = `${this.serverUser}@${this.serverHost}`;
      const portOption = `-P ${this.serverPort}`;
      
      let scpCmd;
      if (this.useKey) {
        scpCmd = `scp ${portOption} "${sourcePath}" ${host}:"${remoteFilePath}"`;
      } else {
        if (!this.serverPassword) {
          throw new Error('使用密码认证但未设置SERVER_PASSWORD');
        }
        scpCmd = `sshpass -p "${this.serverPassword}" scp ${portOption} "${sourcePath}" ${host}:"${remoteFilePath}"`;
      }
      
      console.log(`📤 上传文件到服务器: ${newFileName}`);
      execSync(scpCmd, { stdio: 'pipe' });
      console.log(`✅ 文件上传成功`);
      
      // 返回访问URL
      return {
        relativePath: `${this.urlPrefix}/${newFileName}`,
        fullUrl: `${this.serverAccessUrl}${this.urlPrefix}/${newFileName}`,
        fileName: newFileName
      };
    } catch (error) {
      console.error('服务器上传失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  deleteFile(fileName) {
    try {
      if (this.mode === 'local') {
        const filePath = path.join(this.uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
      } else {
        const remoteFilePath = `${this.serverUploadsDir}/${fileName}`;
        const rmCmd = this.buildSSHCommand(`rm -f ${remoteFilePath}`);
        execSync(rmCmd, { stdio: 'pipe' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }
}

module.exports = new FileManager();
