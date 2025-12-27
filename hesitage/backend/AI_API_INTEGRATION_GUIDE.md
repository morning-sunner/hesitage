# AI API 接入指南

## 推荐方案：DeepSeek API

### 优势
- 🌟 **性价比极高**：比OpenAI便宜90%以上
- 🚀 **响应速度快**：国内访问快速
- 💰 **免费额度**：注册即送500万tokens
- 🎯 **效果好**：DeepSeek-V3 性能优秀

### 步骤1：注册并获取API Key

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 进入控制台 -> API Keys
4. 创建新的API Key并保存

### 步骤2：安装依赖

```bash
cd hesitage/backend
npm install axios
```

### 步骤3：配置环境变量

在 `hesitage/backend` 目录创建 `.env` 文件：

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 步骤4：创建AI服务模块

创建文件 `hesitage/backend/services/aiService.js`

### 步骤5：更新后端API

修改 `hesitage/backend/routes/api.js` 中的 `/ai-dialog` 路由

### 步骤6：测试

启动后端服务，访问前端AI对话页面测试。

---

## 备选方案

### 方案2：智谱AI (GLM-4)
- 官网：https://open.bigmodel.cn/
- 清华出品，中文效果好
- 有免费试用额度

### 方案3：阿里通义千问
- 官网：https://dashscope.aliyun.com/
- 阿里云产品，有免费额度
- 需要实名认证

### 方案4：本地Ollama（完全免费）
- 下载：https://ollama.ai/
- 本地运行，无需API Key
- 需要较好的电脑配置

---

## 系统提示词建议

```javascript
const systemPrompt = `你是长三角非物质文化遗产平台的AI助手。你的职责是：
1. 回答关于长三角地区非遗文化的问题
2. 介绍非遗项目、传承人、相关书籍和影视作品
3. 引导用户探索平台的各项功能
4. 保持友好、专业的语气

长三角非遗项目包括：昆曲、苏州评弹、南京云锦、龙井茶制作、宣纸制作、徽州木雕、浙江剪纸等。

请用简洁、易懂的语言回答问题，必要时可以分点说明。`;
```

## 成本估算

### DeepSeek API 定价
- 输入：1元/百万tokens
- 输出：2元/百万tokens
- 免费额度：500万tokens

**估算**：假设每次对话平均消耗1000 tokens，免费额度可支持约5000次对话。

## 注意事项

1. ⚠️ **不要将API Key提交到Git**：添加 `.env` 到 `.gitignore`
2. 🔒 **API Key安全**：不要在前端代码中暴露API Key
3. 📊 **监控用量**：定期检查API使用情况
4. ⏱️ **设置超时**：避免长时间等待
5. 🚫 **错误处理**：添加完善的错误处理逻辑
