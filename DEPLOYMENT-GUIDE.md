# Mock Data Generator 部署指南

本指南将帮助您将 Mock Data Generator 应用部署到服务器上。

## 目录结构

部署后的服务器目录结构如下：
```
/home/mockdatagenerator/
├── frontend/          # 前端静态文件
│   ├── index.html
│   ├── assets/
│   └── ...
└── backend/           # 后端API服务
    ├── server.js
    ├── package.json
    ├── .env
    └── ...
```

## 部署步骤

### 1. 前端部署

#### 1.1 本地构建
```bash
# 在项目根目录执行
npm run build:prod
```

#### 1.2 上传到服务器
```bash
# 方法1: 使用scp
scp -r dist/* user@your-server:/home/mockdatagenerator/frontend/

# 方法2: 使用rsync (推荐)
rsync -avz --delete dist/ user@your-server:/home/mockdatagenerator/frontend/
```

#### 1.3 使用部署脚本
```bash
# Linux/Mac
chmod +x deploy-frontend.sh
./deploy-frontend.sh

# Windows
deploy-frontend.bat
```

### 2. 后端部署

#### 2.1 准备部署文件
```bash
# Linux/Mac
chmod +x deploy-backend.sh
./deploy-backend.sh

# Windows
deploy-backend.bat
```

#### 2.2 上传到服务器
```bash
# 上传backend-deploy目录下的所有文件
scp -r backend-deploy/* user@your-server:/home/mockdatagenerator/backend/
```

#### 2.3 服务器端配置
```bash
# 登录服务器
ssh user@your-server

# 进入后端目录
cd /home/mockdatagenerator/backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env  # 如果有示例文件
nano .env  # 编辑环境变量

# 启动服务
npm run start:prod

# 或使用PM2管理进程（推荐）
npm install -g pm2
pm2 start server.js --name mockdata-api
pm2 startup  # 设置开机自启
pm2 save
```

### 3. Nginx 配置

#### 3.1 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# 或
sudo dnf install nginx
```

#### 3.2 配置Nginx
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/mockdata

# 创建软链接
sudo ln -s /etc/nginx/sites-available/mockdata /etc/nginx/sites-enabled/

# 或者直接编辑主配置文件
sudo nano /etc/nginx/nginx.conf
```

#### 3.3 修改配置
编辑 `/etc/nginx/sites-available/mockdata` 文件：
- 将 `your-domain.com` 替换为您的域名或服务器IP
- 确认前端文件路径：`/home/mockdatagenerator/frontend`
- 确认后端API端口：`http://localhost:3001`

#### 3.4 测试并重启Nginx
```bash
# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 4. 防火墙配置

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # 如果需要直接访问API

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 5. 数据库配置（如果使用）

如果您的应用使用数据库，请确保：
1. 数据库服务已安装并运行
2. 创建了相应的数据库和用户
3. 在 `.env` 文件中配置了正确的数据库连接信息

```bash
# MySQL示例
mysql -u root -p
CREATE DATABASE mockdata_db;
CREATE USER 'mockdata_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mockdata_db.* TO 'mockdata_user'@'localhost';
FLUSH PRIVILEGES;
```

## 验证部署

### 检查服务状态
```bash
# 检查后端服务
pm2 status
# 或
ps aux | grep node

# 检查Nginx状态
sudo systemctl status nginx

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :3001
```

### 测试访问
1. 访问 `http://your-domain.com` 查看前端页面
2. 访问 `http://your-domain.com/api/health` 测试API连接
3. 检查浏览器开发者工具中的网络请求

## 常见问题

### 1. 权限问题
```bash
# 确保nginx用户可以访问文件
sudo chown -R nginx:nginx /home/mockdatagenerator/frontend
sudo chmod -R 755 /home/mockdatagenerator/frontend
```

### 2. 端口冲突
```bash
# 检查端口占用
sudo lsof -i :80
sudo lsof -i :3001

# 修改后端端口（在.env文件中）
PORT=3002
```

### 3. API请求失败
- 检查后端服务是否正常运行
- 确认nginx配置中的proxy_pass地址正确
- 检查防火墙设置

### 4. 静态文件404
- 确认前端文件路径正确
- 检查nginx配置中的root路径
- 确认文件权限设置

## 更新部署

### 前端更新
```bash
# 本地构建新版本
npm run build:prod

# 上传到服务器
rsync -avz --delete dist/ user@your-server:/home/mockdatagenerator/frontend/
```

### 后端更新
```bash
# 准备新版本文件
./deploy-backend.sh

# 上传到服务器
scp -r backend-deploy/* user@your-server:/home/mockdatagenerator/backend/

# 在服务器上重启服务
ssh user@your-server
cd /home/mockdatagenerator/backend
npm install --production  # 如果有新依赖
pm2 restart mockdata-api
```

## 监控和日志

### PM2监控
```bash
pm2 monit              # 实时监控
pm2 logs mockdata-api   # 查看日志
pm2 restart mockdata-api # 重启服务
```

### Nginx日志
```bash
sudo tail -f /var/log/nginx/mockdata_access.log
sudo tail -f /var/log/nginx/mockdata_error.log
```

## 安全建议

1. **使用HTTPS**: 在生产环境中配置SSL证书
2. **定期更新**: 保持系统和依赖包的更新
3. **备份数据**: 定期备份数据库和重要文件
4. **监控日志**: 定期检查访问日志和错误日志
5. **限制访问**: 配置适当的防火墙规则

## 支持

如果在部署过程中遇到问题，请检查：
1. 服务器系统要求（Node.js版本、系统版本等）
2. 网络连接和防火墙设置
3. 文件权限和目录结构
4. 日志文件中的错误信息