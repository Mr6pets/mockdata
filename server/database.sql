-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS mockdata_templates DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE mockdata_templates;

-- 创建模板表
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字段模板表';

-- 插入一些示例数据（可选）
INSERT INTO templates (id, name, description, fields, is_custom, created_at) VALUES
('sample-1', '用户信息模板', '包含用户基本信息的字段组合', 
 '[{"name":"id","type":"uuid","required":true},{"name":"name","type":"name","required":true},{"name":"email","type":"email","required":true},{"name":"phone","type":"phone","required":false}]', 
 false, NOW()),
('sample-2', '商品信息模板', '电商商品相关字段', 
 '[{"name":"productId","type":"uuid","required":true},{"name":"productName","type":"string","required":true},{"name":"price","type":"price","required":true}]', 
 false, NOW());