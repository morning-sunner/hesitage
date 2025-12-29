@echo off
REM 快速开始脚本 - 安装所有依赖并启动开发服务器

echo.
echo ========================================
echo   长三角非遗地图应用 - 快速开始
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 安装
    echo 请先安装 Node.js (版本 20.19+ 或 22.12+)
    pause
    exit /b 1
)

echo [✓] Node.js 已安装
node --version

REM 进入前端目录
cd hesitage\front

echo.
echo [*] 安装前端依赖...
call npm install

if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)

echo [✓] 前端依赖安装完成

REM 返回上一级目录
cd ..

REM 进入后端目录
cd backend

echo.
echo [*] 安装后端依赖...
call npm install

if %errorlevel% neq 0 (
    echo [错误] 后端依赖安装失败
    cd ..
    pause
    exit /b 1
)

echo [✓] 后端依赖安装完成

cd ..

echo.
echo ========================================
echo   所有依赖安装完成！
echo ========================================
echo.
echo 启动应用:
echo   1. 打开 PowerShell 或 Command Prompt
echo   2. 运行: start-services.bat 或 start.bat
echo.
echo 前端访问地址: http://localhost:5173
echo 后端 API 地址: http://localhost:3000
echo.

pause
