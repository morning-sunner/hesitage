# 前后端集成快速测试指南

## 🚀 快速启动

### 第一步：启动后端
```bash
# 进入后端目录
cd hesitage/backend

# 如果还没装依赖
npm install

# 启动后端服务（默认运行在 http://localhost:3000）
npm start
```

### 第二步：启动前端
```bash
# 进入前端目录
cd hesitage/front

# 如果还没装依赖
npm install

# 启动前端开发服务器（默认运行在 http://localhost:5173）
npm run dev
```

### 第三步：验证环境配置
检查前端 `.env.local` 文件是否包含：
```
VITE_API_URL=http://localhost:3000/api
```

---

## 🧪 测试用例

### 测试 1：注册新用户
1. 打开浏览器访问 `http://localhost:5173/register`
2. 填写表单：
   - 用户名：`testuser123`
   - 邮箱：`test@example.com`
   - 密码：`Test@12345`
   - 确认密码：`Test@12345`
3. 点击"获取验证码"
4. **查看后端日志或邮箱**，应该能看到发送的验证码
5. 将验证码填入表单
6. 点击"注册"
7. **预期结果**：✅ 注册成功，自动登录，跳转到首页

---

### 测试 2：登录用户
1. 访问 `http://localhost:5173/login`
2. 填写表单：
   - 账号：`test@example.com` （或注册时的用户名）
   - 密码：`Test@12345`
3. 点击"登录"
4. **预期结果**：✅ 登录成功，跳转到首页

---

### 测试 3：验证 Token 保存
1. 完成登录后，打开浏览器开发者工具（F12）
2. 切换到"Application" / "存储" 标签
3. 查看 LocalStorage
4. **预期应该看到**：
   - `token`: JWT token 字符串
   - `isLoggedIn`: `"1"`
   - `userId`: 用户 ID 数字
   - `userName`: `testuser123`
   - `userEmail`: `test@example.com`
   - `auth_current_user`: 包含用户信息的 JSON 字符串

---

### 测试 4：忘记密码
1. 访问 `http://localhost:5173/login`
2. 点击"忘记密码？"按钮
3. 填写邮箱：`test@example.com`
4. 点击"发送验证码"
5. **查看后端日志或邮箱**，应该能看到发送的验证码
6. 将验证码填入表单
7. 输入新密码：`NewPass@12345`
8. 确认密码：`NewPass@12345`
9. 点击"重置密码并返回登录"
10. **预期结果**：✅ 密码重置成功，返回登录页

---

### 测试 5：使用新密码登录
1. 用新密码登录（从测试 4 的新密码）
2. **预期结果**：✅ 登录成功

---

## 🐛 常见问题

### ❌ 错误：`Cannot reach API`
**原因**：后端未启动或 API 地址不对
**解决**：
1. 确保后端服务正在运行：`npm start` in `hesitage/backend`
2. 检查 `hesitage/front/.env.local` 中的 `VITE_API_URL`
3. 后端默认端口是 3000，确保没有被占用

---

### ❌ 错误：`邮件发送失败`
**原因**：邮件服务未配置或配置错误
**解决**：
1. 检查 `hesitage/backend/.env` 文件是否有邮件配置
2. 确保邮件服务（如 Gmail）的用户名和密码正确
3. 如果是 Gmail，可能需要使用"应用专用密码"而非真实密码

---

### ❌ 错误：`验证码已过期`
**原因**：验证码有效期为 10 分钟，已过期
**解决**：
重新获取验证码，并在 10 分钟内完成注册或重置密码

---

### ❌ 错误：`该邮箱已被注册` / `用户已存在`
**原因**：该邮箱已经注册过了
**解决**：
使用不同的邮箱地址重新注册

---

## 📊 API 请求/响应示例

### 注册 API
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "Test@12345",
  "confirmPassword": "Test@12345",
  "code": "123456"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "testuser123",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 登录 API
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "account": "test@example.com",
  "password": "Test@12345",
  "rememberMe": false
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "testuser123",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "rememberToken": "random-token-string"
  }
}
```

---

### 发送验证码 API
```bash
POST http://localhost:3000/api/auth/send-code
Content-Type: application/json

{
  "email": "test@example.com",
  "type": "register"  // 或 "reset_password"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "验证码已发送到你的邮箱",
  "expiresAt": 1703558400
}
```

---

## 🔍 调试技巧

### 在浏览器控制台查看请求
1. 打开浏览器开发者工具（F12）
2. 切换到"Network"标签
3. 执行登录/注册操作
4. 查看 `login`, `register`, `send-code` 等请求
5. 检查 Request 和 Response

### 查看后端日志
后端服务会在终端输出日志，注意查看错误信息和调试信息

---

## ✅ 集成完成标志

当你能成功完成以下操作时，说明前后端集成完成：

- [x] 访问注册页面
- [x] 获取验证码（收到邮件）
- [x] 完成注册并自动登录
- [x] localStorage 中有 token
- [x] 访问登录页面
- [x] 使用已注册的账号登录
- [x] 使用忘记密码重置密码
- [x] 使用新密码再次登录

---

## 🎉 下一步

集成完成后，可以：
1. 集成其他页面（首页、个人中心等）需要的用户认证
2. 为需要认证的 API 调用添加 Token 头
3. 实现"自动登录"功能（使用 rememberToken）
4. 完善错误处理和用户提示
5. 进行性能优化和安全加固

---

**最后更新**: 2025-12-26
