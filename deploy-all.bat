@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 一键部署脚本 - Mock Data Generator (Windows版本)
REM 用于快速部署前后端到服务器

echo ==========================================
echo Mock Data Generator 一键部署脚本
echo ==========================================

REM 配置变量（请根据实际情况修改）
set SERVER_USER=your-user
set SERVER_HOST=your-server.com
set FRONTEND_PATH=/home/mockdatagenerator/frontend
set BACKEND_PATH=/home/mockdatagenerator/backend

REM 检查参数
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help

REM 检查配置
if "%SERVER_USER%"=="your-user" (
    echo 错误：请先配置服务器信息！
    echo 编辑脚本顶部的 SERVER_USER 和 SERVER_HOST 变量
    pause
    exit /b 1
)

if "%SERVER_HOST%"=="your-server.com" (
    echo 错误：请先配置服务器信息！
    echo 编辑脚本顶部的 SERVER_USER 和 SERVER_HOST 变量
    pause
    exit /b 1
)

REM 检查SSH连接
echo 检查服务器连接...
ssh -o ConnectTimeout=10 %SERVER_USER%@%SERVER_HOST% "echo SSH连接成功" >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：无法连接到服务器 %SERVER_USER%@%SERVER_HOST%
    echo 请检查：
    echo 1. 服务器地址和用户名是否正确
    echo 2. SSH密钥是否已配置
    echo 3. 网络连接是否正常
    pause
    exit /b 1
)

REM 根据参数选择部署方式
if "%1"=="--frontend-only" goto :deploy_frontend_only
if "%1"=="--backend-only" goto :deploy_backend_only

REM 默认部署前后端
call :deploy_frontend
if %errorlevel% neq 0 exit /b 1
call :deploy_backend
if %errorlevel% neq 0 exit /b 1
goto :success

:deploy_frontend_only
call :deploy_frontend
goto :success

:deploy_backend_only
call :deploy_backend
goto :success

REM 部署前端函数
:deploy_frontend
echo.
echo ==================== 部署前端 ====================

REM 构建前端
echo 正在构建前端项目...
call npm run build:prod
if %errorlevel% neq 0 (
    echo 错误：前端构建失败！
    exit /b 1
)

REM 检查构建结果
if not exist "dist" (
    echo 错误：构建目录 dist 不存在！
    exit /b 1
)

REM 创建服务器目录
echo 创建服务器目录...
ssh %SERVER_USER%@%SERVER_HOST% "mkdir -p %FRONTEND_PATH%"

REM 上传文件
echo 上传前端文件到服务器...
scp -r dist\* %SERVER_USER%@%SERVER_HOST%:%FRONTEND_PATH%/
if %errorlevel% equ 0 (
    echo ✅ 前端部署成功！
) else (
    echo ❌ 前端部署失败！
    echo 提示：如果没有scp命令，请使用WinSCP或FileZilla等工具手动上传
    echo 将 dist\ 目录下的所有文件上传到服务器的 %FRONTEND_PATH% 目录
    exit /b 1
)
exit /b 0

REM 部署后端函数
:deploy_backend
echo.
echo ==================== 部署后端 ====================

REM 进入server目录
cd server

REM 检查必要文件
if not exist "server.js" (
    echo 错误：缺少 server.js 文件！
    exit /b 1
)
if not exist "package.json" (
    echo 错误：缺少 package.json 文件！
    exit /b 1
)

REM 准备部署文件
echo 准备后端部署文件...
set DEPLOY_DIR=..\backend-deploy
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

REM 复制文件
copy *.js "%DEPLOY_DIR%\" >nul 2>&1
copy package.json "%DEPLOY_DIR%\"
copy .env.production "%DEPLOY_DIR%\.env" >nul 2>&1 || echo 警告：.env.production文件不存在
copy *.sql "%DEPLOY_DIR%\" >nul 2>&1
copy *.json "%DEPLOY_DIR%\" >nul 2>&1
copy README.md "%DEPLOY_DIR%\" >nul 2>&1

REM 创建服务器目录
echo 创建服务器目录...
ssh %SERVER_USER%@%SERVER_HOST% "mkdir -p %BACKEND_PATH%"

REM 上传文件
echo 上传后端文件到服务器...
scp -r %DEPLOY_DIR%\* %SERVER_USER%@%SERVER_HOST%:%BACKEND_PATH%/
if %errorlevel% equ 0 (
    echo ✅ 后端文件上传成功！
) else (
    echo ❌ 后端文件上传失败！
    echo 提示：如果没有scp命令，请使用WinSCP或FileZilla等工具手动上传
    echo 将 backend-deploy\ 目录下的所有文件上传到服务器的 %BACKEND_PATH% 目录
    cd ..
    exit /b 1
)

REM 在服务器上安装依赖和重启服务
echo 在服务器上安装依赖...
ssh %SERVER_USER%@%SERVER_HOST% "cd %BACKEND_PATH% && npm install --production"

echo 重启后端服务...
ssh %SERVER_USER%@%SERVER_HOST% "cd %BACKEND_PATH% && pm2 restart mockdata-api || pm2 start server.js --name mockdata-api" || (
    echo 警告：PM2重启失败，请手动启动服务
    echo 在服务器上执行：
    echo   cd %BACKEND_PATH%
    echo   npm run start:prod
)

cd ..
echo ✅ 后端部署成功！
exit /b 0

:success
echo.
echo ==========================================
echo 🎉 部署完成！
echo ==========================================
echo 前端地址: http://%SERVER_HOST%
echo API地址: http://%SERVER_HOST%/api
echo.
echo 后续步骤：
echo 1. 检查nginx配置是否正确
echo 2. 确认防火墙端口已开放
echo 3. 测试前端页面和API接口
echo 4. 配置SSL证书（生产环境推荐）
echo.
echo 如需查看详细部署文档，请参考 DEPLOYMENT-GUIDE.md
pause
exit /b 0

:help
echo 使用方法：
echo   %0 [选项]
echo.
echo 选项：
echo   --frontend-only    仅部署前端
echo   --backend-only     仅部署后端
echo   --help, -h         显示帮助信息
echo.
echo 配置：
echo   请编辑脚本顶部的配置变量：
echo   - SERVER_USER: 服务器用户名
echo   - SERVER_HOST: 服务器地址
echo   - FRONTEND_PATH: 前端部署路径
echo   - BACKEND_PATH: 后端部署路径
pause
exit /b 0