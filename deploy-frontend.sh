#!/bin/bash

# 前端部署脚本
# 用于将前端打包文件部署到服务器

echo "开始前端部署..."

# 构建前端项目
echo "正在构建前端项目..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "前端构建失败！"
    exit 1
fi

echo "前端构建完成！"

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "错误：dist目录不存在！"
    exit 1
fi

echo "准备上传文件到服务器..."
echo "请执行以下命令将文件上传到服务器："
echo ""
echo "方法1: 使用scp命令"
echo "scp -r dist/* user@your-server:/home/mockdatagenerator/frontend/"
echo ""
echo "方法2: 使用rsync命令"
echo "rsync -avz --delete dist/ user@your-server:/home/mockdatagenerator/frontend/"
echo ""
echo "方法3: 手动上传"
echo "将 dist/ 目录下的所有文件上传到服务器的 /home/mockdatagenerator/frontend/ 目录"
echo ""
echo "注意：请确保服务器上的目录权限正确，nginx用户可以访问这些文件"