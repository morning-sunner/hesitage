# 🚀 AI对话功能快速启动指南

## 📋 前置准备

1. ✅ 前端代码已完成（AIDialogView.vue）
2. ✅ 后端API已更新（/api/ai-dialog）
3. ✅ AI服务模块已创建（services/aiService.js）

## 🔧 安装步骤

### 1. 安装依赖

```bash
cd hesitage/backend
npm install axios
```

### 2. 获取DeepSeek API Key（推荐）

1. 访问：https://platform.deepseek.com/
2. 注册并登录
3. 进入"API Keys"页面
4. 点击"创建新API Key"
5. 复制生成的API Key

**💰 免费额度**: 注册送500万tokens，足够使用很长时间！

### 3. 配置环境变量

在 `hesitage/backend` 目录创建 `.env` 文件：

```bash
# 复制模板文件
copy .env.example .env
```

编辑 `.env` 文件，填入你的API Key：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 4. 启动服务

```bash
# 启动后端（在 hesitage/backend 目录）
npm start

# 启动前端（在 hesitage/front 目录）
npm run dev
```

### 5. 测试

访问 http://localhost:5174/ai，在AI对话页面测试功能。

---

## 🧪 测试问题示例

```
1. 什么是非遗文化？
2. 长三角有哪些著名的非遗项目？
3. 昆曲有什么特点？
4. 如何学习和传承非遗文化？
5. 南京云锦的历史是什么？
```

---

## 🎯 无API Key时的表现

如果没有配置API Key，系统会：
- ✅ 自动使用预设的模拟回复
- ✅ 对常见问题给出合适的答案
- ✅ 不会报错，用户体验良好

---

## 📊 API使用情况监控

在后端控制台会看到：

```
📩 收到AI对话请求: 什么是非遗文化？
✅ AI回复成功 | 输入:245 输出:312 总计:557 tokens
```

---

## 🔄 备选方案

### 方案2: 智谱AI

```env
# 1. 访问 https://open.bigmodel.cn/ 获取API Key
# 2. 修改 services/aiService.js 中的API URL:
# https://open.bigmodel.cn/api/paas/v4/chat/completions
# 3. 模型名改为: glm-4
```

### 方案3: 本地Ollama (完全免费)

```bash
# 1. 下载安装 Ollama: https://ollama.ai/
# 2. 安装模型:
ollama pull qwen2.5

# 3. 启动服务（自动运行在 http://localhost:11434）
# 4. 修改 services/aiService.js 中的 API URL:
# http://localhost:11434/v1/chat/completions
```

---

## ⚠️ 注意事项

1. **不要提交API Key到Git**
   - `.env` 文件已在 `.gitignore` 中
   - 只提交 `.env.example` 模板文件

2. **API调用限制**
   - DeepSeek免费版：每分钟60次请求
   - 超出会返回429错误，系统会自动降级

3. **成本控制**
   - 每次对话约消耗500-1000 tokens
   - 免费额度500万tokens ≈ 5000-10000次对话

---

## 🐛 常见问题

### Q: API调用失败？
A: 检查：
1. API Key是否正确
2. 网络是否正常
3. 是否超出调用限制

### Q: 回复内容不满意？
A: 调整 `services/aiService.js` 中的：
1. `SYSTEM_PROMPT` - 修改AI角色定位
2. `temperature` (0-2) - 控制创造性
3. `max_tokens` - 控制回复长度

### Q: 想要更快的响应？
A: 可以：
1. 减少 `max_tokens` 值
2. 使用更小的模型
3. 考虑本地Ollama方案

---

## 📚 相关文档

- [DeepSeek官方文档](https://platform.deepseek.com/docs)
- [智谱AI文档](https://open.bigmodel.cn/dev/api)
- [Ollama文档](https://ollama.ai/docs)

---

## ✨ 功能展望

未来可以添加：
- 💬 多轮对话记忆
- 🖼️ 图片识别（识别非遗作品）
- 🎨 生成非遗相关图片
- 📊 对话数据分析
- 🌐 多语言支持
