import React, { useState } from 'react';
import { 
  Space, 
  Button, 
  Select, 
  Input, 
  Form, 
  Row, 
  Col, 
  message,
  Typography,
  Divider
} from 'antd';
import { DownloadOutlined, FileTextOutlined, TableOutlined, CodeOutlined } from '@ant-design/icons';
import { GeneratedData, ExportOptions } from '../types';
import { exportData } from '../utils/exportUtils';

const { Option } = Select;
const { Text } = Typography;

interface ExportPanelProps {
  data: GeneratedData[];
}

const ExportPanel: React.FC<ExportPanelProps> = ({ data }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xml'>('json');
  const [filename, setFilename] = useState<string>('mock-data');

  const handleExport = async () => {
    if (!data || data.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }

    setLoading(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        filename: filename || 'mock-data',
        data
      };

      await exportData(options);
      message.success(`成功导出 ${data.length} 条数据`);
    } catch (error) {
      message.error('导出失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <CodeOutlined />;
      case 'csv':
        return <TableOutlined />;
      case 'xml':
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json':
        return 'JavaScript Object Notation - 适用于API和Web应用';
      case 'csv':
        return 'Comma Separated Values - 适用于Excel和数据分析';
      case 'xml':
        return 'eXtensible Markup Language - 适用于数据交换';
      default:
        return '';
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="导出格式">
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                size="large"
              >
                <Option value="json">
                  <Space>
                    <CodeOutlined />
                    JSON
                  </Space>
                </Option>
                <Option value="csv">
                  <Space>
                    <TableOutlined />
                    CSV
                  </Space>
                </Option>
                <Option value="xml">
                  <Space>
                    <FileTextOutlined />
                    XML
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label="文件名">
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="请输入文件名"
                size="large"
                suffix={`.${exportFormat}`}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label=" " style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={loading}
                size="large"
                block
              >
                导出数据
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Space>
            {getFormatIcon(exportFormat)}
            <Text strong>当前格式: {exportFormat.toUpperCase()}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary">{getFormatDescription(exportFormat)}</Text>
          </div>
        </div>

        <div>
          <Text type="secondary">
            将导出 {data.length} 条记录，包含 {data.length > 0 ? Object.keys(data[0]).length : 0} 个字段
          </Text>
        </div>

        {/* 快速导出按钮 */}
        <Space wrap>
          <Button
            icon={<CodeOutlined />}
            onClick={() => {
              setExportFormat('json');
              setTimeout(handleExport, 100);
            }}
            loading={loading && exportFormat === 'json'}
          >
            快速导出 JSON
          </Button>
          <Button
            icon={<TableOutlined />}
            onClick={() => {
              setExportFormat('csv');
              setTimeout(handleExport, 100);
            }}
            loading={loading && exportFormat === 'csv'}
          >
            快速导出 CSV
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => {
              setExportFormat('xml');
              setTimeout(handleExport, 100);
            }}
            loading={loading && exportFormat === 'xml'}
          >
            快速导出 XML
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default ExportPanel;