# 环境配置文件部署说明

## 概述
本项目的环境配置文件（.env）包含敏感信息，不会提交到版本控制系统。需要手动部署到服务器。

## 配置文件说明

### 开发环境 (.env)
- 用于本地开发
- 数据库连接本地MySQL
- CORS允许本地前端访问
- 日志级别为debug

### 生产环境 (.env.production)
- 用于生产服务器部署
- 数据库连接生产环境MySQL
- CORS配置生产域名
- 日志级别为info

## 部署步骤

### 1. 本地准备配置文件
确保本地已有正确的环境配置文件：
- `server/.env` - 开发环境配置
- `server/.env.production` - 生产环境配置

### 2. 上传到服务器
使用以下命令将配置文件上传到服务器：

```bash
# 上传生产环境配置文件
scp server/.env.production root@mockdatagenerator.guluwater.com:/home/mockdatagenerator/backend/.env

# 或者使用rsync
rsync -av server/.env.production root@mockdatagenerator.guluwater.com:/home/mockdatagenerator/backend/.env
```

### 3. 验证配置
登录服务器验证配置文件是否正确：

```bash
ssh root@mockdatagenerator.guluwater.com
cd /home/mockdatagenerator/backend
cat .env
```

### 4. 重启服务
配置文件更新后，重启后端服务：

```bash
pm2 restart mockdata-api
pm2 logs mockdata-api --lines 20
```

## 安全注意事项

1. **永远不要提交.env文件到版本控制**
2. **定期更新密钥和密码**
3. **使用强密码和复杂的JWT密钥**
4. **限制服务器访问权限**
5. **定期备份配置文件**

## 配置文件模板

参考 `server/.env.example` 文件了解所需的配置项。

## 故障排除

如果服务启动失败，检查：
1. 配置文件是否存在
2. 数据库连接信息是否正确
3. 数据库用户权限是否足够
4. 端口是否被占用