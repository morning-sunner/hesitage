@echo off
chcp 65001 >nul
echo ========================================
echo 长三角非遗平台 - 启动服务
echo ========================================
echo.

cd /d "%~dp0hesitage\backend"
echo [1/2] 启动后端服务 (端口 3000)...
start "后端服务" cmd /k "npm start"

timeout /t 3 >nul

cd /d "%~dp0hesitage\front"
echo [2/2] 启动前端服务 (端口 5174)...
start "前端服务" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ 服务启动完成！
echo.
echo 后端: http://localhost:3000
echo 前端: http://localhost:5174
echo AI对话: http://localhost:5174/ai
echo ========================================
echo.
echo 注意: API余额不足时会自动使用预设回复
echo.
pause
