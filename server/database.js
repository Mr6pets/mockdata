const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mockdata_generator',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 数据库操作类
class TemplateDatabase {
  // 获取所有模板
  async getAllTemplates() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, description, fields, is_custom, created_at, updated_at FROM templates ORDER BY created_at DESC'
      );
      
      // 解析JSON字段
      return rows.map(row => ({
        ...row,
        fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
        is_custom: Boolean(row.is_custom)
      }));
    } catch (error) {
      console.error('获取模板失败:', error);
      throw error;
    }
  }

  // 根据ID获取模板
  async getTemplateById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, description, fields, is_custom, created_at, updated_at FROM templates WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const template = rows[0];
      return {
        ...template,
        fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields,
        is_custom: Boolean(template.is_custom)
      };
    } catch (error) {
      console.error('获取模板失败:', error);
      throw error;
    }
  }

  // 创建新模板
  async createTemplate(template) {
    try {
      const { id, name, description, fields, is_custom = true } = template;
      
      await pool.execute(
        'INSERT INTO templates (id, name, description, fields, is_custom) VALUES (?, ?, ?, ?, ?)',
        [id, name, description || '', JSON.stringify(fields), is_custom]
      );
      
      return await this.getTemplateById(id);
    } catch (error) {
      console.error('创建模板失败:', error);
      throw error;
    }
  }

  // 更新模板
  async updateTemplate(id, updates) {
    try {
      const { name, description, fields } = updates;
      
      await pool.execute(
        'UPDATE templates SET name = ?, description = ?, fields = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || '', JSON.stringify(fields), id]
      );
      
      return await this.getTemplateById(id);
    } catch (error) {
      console.error('更新模板失败:', error);
      throw error;
    }
  }

  // 删除模板
  async deleteTemplate(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM templates WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除模板失败:', error);
      throw error;
    }
  }

  // 检查数据库连接
  async checkConnection() {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('数据库连接失败:', error);
      return false;
    }
  }

  // 初始化数据库表（如果不存在）
  async initializeDatabase() {
    try {
      // 创建数据库（如果不存在）
      const tempConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        charset: 'utf8mb4'
      });

      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConnection.end();

      // 创建表（如果不存在）
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS templates (
          id VARCHAR(36) PRIMARY KEY COMMENT '模板唯一标识符',
          name VARCHAR(100) NOT NULL COMMENT '模板名称',
          description TEXT COMMENT '模板描述',
          fields JSON NOT NULL COMMENT '字段配置（JSON格式）',
          is_custom BOOLEAN DEFAULT TRUE COMMENT '是否为自定义模板',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_name (name),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字段模板表'
      `);

      console.log('数据库初始化成功');
      return true;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }
}

module.exports = new TemplateDatabase();