# 安全指南

## 版本控制安全

### ✅ 应该提交到远程仓库的文件

- **源代码文件**：`.js`, `.ts`, `.tsx`, `.css`, `.html`
- **配置文件**：`package.json`, `tsconfig.json`, `vite.config.ts`
- **示例文件**：`.env.example`, `deploy-config.example.json`
- **文档文件**：`README.md`, `DEPLOYMENT.md`, `*.md`
- **构建脚本**：`deploy-*.sh`, `deploy-*.bat`
- **静态资源**：`public/` 目录下的文件
- **项目配置**：`.gitignore`, `.eslintrc.*`, `.prettierrc.*`

### ❌ 绝对不能提交到远程仓库的文件

- **环境变量文件**：`.env`, `.env.local`, `.env.production`
- **构建输出**：`dist/`, `build/`, `node_modules/`
- **数据库文件**：`*.db`, `*.sqlite`, `*.sqlite3`
- **日志文件**：`*.log`, `logs/`
- **密钥文件**：`*.pem`, `*.key`, `*.crt`, `*.p12`
- **部署配置**：`deploy-config.json`, `deploy-secrets.*`
- **临时文件**：`*.tmp`, `.cache/`, `temp/`
- **用户上传内容**：`uploads/`, `public/uploads/`

## 环境变量安全

### 1. 使用示例文件
```bash
# 创建示例文件
cp .env.example .env
# 编辑实际配置
nano .env
```

### 2. 分环境管理
- `.env.development` - 开发环境
- `.env.test` - 测试环境  
- `.env.production` - 生产环境（服务器上配置）

### 3. 敏感信息处理
- 数据库密码
- JWT密钥
- 第三方API密钥
- 会话密钥

## 部署安全

### 1. SSH密钥认证（推荐）
```bash
# 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id user@your-server.com

# 测试连接
ssh user@your-server.com
```

### 2. 部署配置
```bash
# 复制配置模板
cp deploy-config.example.json deploy-config.json
# 编辑实际配置（不要提交此文件）
nano deploy-config.json
```

### 3. 服务器权限
```bash
# 设置正确的文件权限
chmod 644 /home/mockdatagenerator/frontend/*
chmod 755 /home/mockdatagenerator/backend/
chown -R www-data:www-data /home/mockdatagenerator/frontend/
```

## 最佳实践

### 1. 定期检查
- 使用 `git status` 检查暂存区
- 使用 `git log --oneline` 检查提交历史
- 定期审查 `.gitignore` 文件

### 2. 密钥轮换
- 定期更换JWT密钥
- 更新数据库密码
- 轮换API密钥

### 3. 监控和审计
- 监控异常登录
- 记录部署日志
- 定期安全扫描

## 紧急情况处理

### 如果意外提交了敏感信息

1. **立即更改密钥**
```bash
# 更改所有相关密码和密钥
```

2. **从Git历史中移除**
```bash
# 使用git filter-branch或BFG Repo-Cleaner
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all
```

3. **强制推送**
```bash
git push origin --force --all
```

4. **通知团队成员**重新克隆仓库

## 联系方式

如发现安全问题，请立即联系项目维护者。