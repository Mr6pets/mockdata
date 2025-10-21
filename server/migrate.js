const fs = require('fs-extra');
const path = require('path');
const database = require('./database');
require('dotenv').config();

// 数据迁移脚本
const migrateData = async () => {
  try {
    console.log('开始数据迁移...');
    
    // 初始化数据库
    await database.initializeDatabase();
    
    // 检查数据库连接
    const isConnected = await database.checkConnection();
    if (!isConnected) {
      console.error('数据库连接失败');
      return;
    }
    
    // 读取JSON文件
    const jsonPath = path.join(__dirname, 'templates.json');
    
    if (!await fs.pathExists(jsonPath)) {
      console.log('未找到templates.json文件，跳过数据迁移');
      return;
    }
    
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const templates = JSON.parse(jsonData || '[]');
    
    if (templates.length === 0) {
      console.log('JSON文件中没有数据，跳过迁移');
      return;
    }
    
    console.log(`找到 ${templates.length} 个模板，开始迁移...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 逐个迁移模板
    for (const template of templates) {
      try {
        // 检查模板是否已存在
        const existingTemplate = await database.getTemplateById(template.id);
        
        if (existingTemplate) {
          console.log(`模板 "${template.name}" (ID: ${template.id}) 已存在，跳过`);
          continue;
        }
        
        // 转换数据格式
        const migratedTemplate = {
          id: template.id,
          name: template.name,
          description: template.description || '',
          fields: template.fields,
          is_custom: template.isCustom !== undefined ? template.isCustom : true
        };
        
        await database.createTemplate(migratedTemplate);
        console.log(`✓ 成功迁移模板: "${template.name}"`);
        successCount++;
        
      } catch (error) {
        console.error(`✗ 迁移模板失败: "${template.name}"`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n数据迁移完成！');
    console.log(`成功: ${successCount} 个模板`);
    console.log(`失败: ${errorCount} 个模板`);
    
    // 备份原JSON文件
    if (successCount > 0) {
      const backupPath = path.join(__dirname, `templates_backup_${Date.now()}.json`);
      await fs.copy(jsonPath, backupPath);
      console.log(`原JSON文件已备份到: ${backupPath}`);
    }
    
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  migrateData().then(() => {
    console.log('迁移脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('迁移脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { migrateData };