@echo off
chcp 65001 >nul

REM 前端部署脚本 (Windows版本)
REM 用于将前端打包文件部署到服务器

echo 开始前端部署...

REM 构建前端项目
echo 正在构建前端项目...
call npm run build:prod

if %errorlevel% neq 0 (
    echo 前端构建失败！
    pause
    exit /b 1
)

echo 前端构建完成！

REM 检查dist目录是否存在
if not exist "dist" (
    echo 错误：dist目录不存在！
    pause
    exit /b 1
)

echo 准备上传文件到服务器...
echo 请执行以下命令将文件上传到服务器：
echo.
echo 方法1: 使用scp命令 (需要安装OpenSSH或Git Bash)
echo scp -r dist/* user@your-server:/home/mockdatagenerator/frontend/
echo.
echo 方法2: 使用WinSCP或FileZilla等FTP工具
echo 将 dist\ 目录下的所有文件上传到服务器的 /home/mockdatagenerator/frontend/ 目录
echo.
echo 方法3: 使用PowerShell的scp命令 (Windows 10+)
echo scp -r dist\* user@your-server:/home/mockdatagenerator/frontend/
echo.
echo 注意：请确保服务器上的目录权限正确，nginx用户可以访问这些文件
pause