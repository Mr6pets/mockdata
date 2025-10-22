@echo off
chcp 65001 >nul

REM 后端部署脚本 (Windows版本)
REM 用于将后端文件部署到服务器

echo 开始后端部署...

REM 进入server目录
cd server

REM 检查必要文件是否存在
if not exist "server.js" (
    echo 错误：server.js文件不存在！
    pause
    exit /b 1
)

if not exist "package.json" (
    echo 错误：package.json文件不存在！
    pause
    exit /b 1
)

echo 准备后端部署文件...

REM 创建临时部署目录
set DEPLOY_DIR=..\backend-deploy
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

REM 复制必要文件（排除node_modules和开发文件）
echo 复制后端文件...
copy *.js "%DEPLOY_DIR%\" >nul 2>&1
copy package.json "%DEPLOY_DIR%\"
copy .env.production "%DEPLOY_DIR%\.env" >nul 2>&1 || echo 警告：.env.production文件不存在
copy *.sql "%DEPLOY_DIR%\" >nul 2>&1
copy *.json "%DEPLOY_DIR%\" >nul 2>&1
copy README.md "%DEPLOY_DIR%\" >nul 2>&1

echo 后端文件准备完成！
echo.
echo 请执行以下步骤将后端部署到服务器：
echo.
echo 1. 上传文件到服务器：
echo    使用WinSCP、FileZilla等工具将 backend-deploy\ 目录下的所有文件
echo    上传到服务器的 /home/mockdatagenerator/backend/ 目录
echo.
echo    或使用scp命令（需要OpenSSH）：
echo    scp -r backend-deploy\* user@your-server:/home/mockdatagenerator/backend/
echo.
echo 2. 在服务器上安装依赖：
echo    ssh user@your-server
echo    cd /home/mockdatagenerator/backend
echo    npm install --production
echo.
echo 3. 配置环境变量：
echo    编辑 /home/mockdatagenerator/backend/.env 文件
echo    设置数据库连接信息和其他配置
echo.
echo 4. 启动服务：
echo    npm run start:prod
echo    或使用 PM2: pm2 start server.js --name mockdata-api
echo.
echo 5. 设置开机自启动（可选）：
echo    pm2 startup
echo    pm2 save
echo.
echo 注意：请确保服务器上已安装 Node.js 和 npm
pause