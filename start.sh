#!/bin/bash

echo "================================"
echo "长三角非遗 WebGIS 项目启动脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"
echo "✓ npm 版本: $(npm -v)"
echo ""

# 前端构建
echo "📦 安装前端依赖..."
cd hesitage/front
npm install
echo "✓ 前端依赖安装完成"
echo ""

# 启动前端开发服务器
echo "🚀 启动前端开发服务器..."
echo "访问地址: http://localhost:5173"
echo ""
echo "地图页面: http://localhost:5173/map"
echo ""

npm run dev
