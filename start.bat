@echo off
chcp 65001 > nul
echo ================================
echo 长三角非遗 WebGIS 项目启动脚本
echo ================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)

echo ✓ Node.js 已安装
echo ✓ npm 已安装
echo.

REM 前端构建
echo 📦 安装前端依赖...
cd hesitage\front
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✓ 前端依赖安装完成
echo.

REM 启动前端开发服务器
echo 🚀 启动前端开发服务器...
echo 访问地址: http://localhost:5173
echo.
echo 地图页面: http://localhost:5173/map
echo 非遗项目: http://localhost:5173/heritage
echo 传承人: http://localhost:5173/detail
echo 智能对话: http://localhost:5173/chat
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev

pause
