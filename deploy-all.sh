#!/bin/bash

# 一键部署脚本 - Mock Data Generator
# 用于快速部署前后端到服务器

set -e  # 遇到错误立即退出

echo "=========================================="
echo "Mock Data Generator 一键部署脚本"
echo "=========================================="

# 配置变量（请根据实际情况修改）
SERVER_USER="your-user"
SERVER_HOST="your-server.com"
FRONTEND_PATH="/home/mockdatagenerator/frontend"
BACKEND_PATH="/home/mockdatagenerator/backend"

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "使用方法："
    echo "  $0 [选项]"
    echo ""
    echo "选项："
    echo "  --frontend-only    仅部署前端"
    echo "  --backend-only     仅部署后端"
    echo "  --help, -h         显示帮助信息"
    echo ""
    echo "配置："
    echo "  请编辑脚本顶部的配置变量："
    echo "  - SERVER_USER: 服务器用户名"
    echo "  - SERVER_HOST: 服务器地址"
    echo "  - FRONTEND_PATH: 前端部署路径"
    echo "  - BACKEND_PATH: 后端部署路径"
    exit 0
fi

# 检查配置
if [ "$SERVER_USER" = "your-user" ] || [ "$SERVER_HOST" = "your-server.com" ]; then
    echo "错误：请先配置服务器信息！"
    echo "编辑脚本顶部的 SERVER_USER 和 SERVER_HOST 变量"
    exit 1
fi

# 检查SSH连接
echo "检查服务器连接..."
if ! ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'SSH连接成功'" >/dev/null 2>&1; then
    echo "错误：无法连接到服务器 $SERVER_USER@$SERVER_HOST"
    echo "请检查："
    echo "1. 服务器地址和用户名是否正确"
    echo "2. SSH密钥是否已配置"
    echo "3. 网络连接是否正常"
    exit 1
fi

# 部署前端
deploy_frontend() {
    echo ""
    echo "==================== 部署前端 ===================="
    
    # 构建前端
    echo "正在构建前端项目..."
    if ! npm run build:prod; then
        echo "错误：前端构建失败！"
        exit 1
    fi
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        echo "错误：构建目录 dist 不存在！"
        exit 1
    fi
    
    # 创建服务器目录
    echo "创建服务器目录..."
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $FRONTEND_PATH"
    
    # 上传文件
    echo "上传前端文件到服务器..."
    if rsync -avz --delete --progress dist/ "$SERVER_USER@$SERVER_HOST:$FRONTEND_PATH/"; then
        echo "✅ 前端部署成功！"
    else
        echo "❌ 前端部署失败！"
        exit 1
    fi
}

# 部署后端
deploy_backend() {
    echo ""
    echo "==================== 部署后端 ===================="
    
    # 进入server目录
    cd server
    
    # 检查必要文件
    if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
        echo "错误：缺少必要的后端文件！"
        exit 1
    fi
    
    # 准备部署文件
    echo "准备后端部署文件..."
    DEPLOY_DIR="../backend-deploy"
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    # 复制文件
    cp -r *.js "$DEPLOY_DIR/" 2>/dev/null || true
    cp package.json "$DEPLOY_DIR/"
    cp .env.production "$DEPLOY_DIR/.env" 2>/dev/null || echo "警告：.env.production文件不存在"
    cp *.sql "$DEPLOY_DIR/" 2>/dev/null || true
    cp *.json "$DEPLOY_DIR/" 2>/dev/null || true
    cp README.md "$DEPLOY_DIR/" 2>/dev/null || true
    
    # 创建服务器目录
    echo "创建服务器目录..."
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $BACKEND_PATH"
    
    # 上传文件
    echo "上传后端文件到服务器..."
    if rsync -avz --progress "$DEPLOY_DIR/" "$SERVER_USER@$SERVER_HOST:$BACKEND_PATH/"; then
        echo "✅ 后端文件上传成功！"
    else
        echo "❌ 后端文件上传失败！"
        exit 1
    fi
    
    # 在服务器上安装依赖和重启服务
    echo "在服务器上安装依赖..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $BACKEND_PATH && npm install --production"
    
    echo "重启后端服务..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $BACKEND_PATH && pm2 restart mockdata-api || pm2 start server.js --name mockdata-api" || {
        echo "警告：PM2重启失败，请手动启动服务"
        echo "在服务器上执行："
        echo "  cd $BACKEND_PATH"
        echo "  npm run start:prod"
    }
    
    cd ..
    echo "✅ 后端部署成功！"
}

# 主部署流程
case "$1" in
    --frontend-only)
        deploy_frontend
        ;;
    --backend-only)
        deploy_backend
        ;;
    *)
        deploy_frontend
        deploy_backend
        ;;
esac

echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo "前端地址: http://$SERVER_HOST"
echo "API地址: http://$SERVER_HOST/api"
echo ""
echo "后续步骤："
echo "1. 检查nginx配置是否正确"
echo "2. 确认防火墙端口已开放"
echo "3. 测试前端页面和API接口"
echo "4. 配置SSL证书（生产环境推荐）"
echo ""
echo "如需查看详细部署文档，请参考 DEPLOYMENT-GUIDE.md"