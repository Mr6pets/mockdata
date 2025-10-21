const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const database = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// API 路由

// 获取所有自定义模板
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await database.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('获取模板失败:', error);
    res.status(500).json({ error: '获取模板失败' });
  }
});

// 创建新模板
app.post('/api/templates', async (req, res) => {
  const { id, name, description, fields } = req.body;
  
  if (!id || !name || !fields) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  
  try {
    // 检查是否已存在相同ID的模板
    const existingTemplate = await database.getTemplateById(id);
    if (existingTemplate) {
      return res.status(409).json({ error: '模板ID已存在' });
    }
    
    const newTemplate = {
      id,
      name,
      description,
      fields,
      is_custom: true
    };
    
    const createdTemplate = await database.createTemplate(newTemplate);
    
    res.json({ 
      message: '模板创建成功',
      template: createdTemplate
    });
  } catch (error) {
    console.error('创建模板失败:', error);
    res.status(500).json({ error: '创建模板失败' });
  }
});

// 删除模板
app.delete('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const success = await database.deleteTemplate(id);
    
    if (success) {
      res.json({ message: '模板删除成功' });
    } else {
      res.status(404).json({ error: '模板不存在' });
    }
  } catch (error) {
    console.error('删除模板失败:', error);
    res.status(500).json({ error: '删除模板失败' });
  }
});

// 更新模板
app.put('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, fields } = req.body;
  
  if (!name || !fields) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  
  try {
    const updatedTemplate = await database.updateTemplate(id, {
      name,
      description,
      fields
    });
    
    if (updatedTemplate) {
      res.json({ 
        message: '模板更新成功',
        template: updatedTemplate
      });
    } else {
      res.status(404).json({ error: '模板不存在' });
    }
  } catch (error) {
    console.error('更新模板失败:', error);
    res.status(500).json({ error: '更新模板失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await database.initializeDatabase();
    
    // 检查数据库连接
    const isConnected = await database.checkConnection();
    if (!isConnected) {
      console.error('数据库连接失败，服务器启动中止');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`MySQL数据库连接成功`);
      console.log(`数据库: ${process.env.DB_NAME || 'mockdata_generator'}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});