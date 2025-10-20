import React, { useState } from 'react';
import { Layout, Typography, Card, Space, Button, message, Tabs } from 'antd';
import { DatabaseOutlined, DownloadOutlined, ApiOutlined } from '@ant-design/icons';
import FieldConfigPanel from './components/FieldConfigPanel';
import DataPreview from './components/DataPreview';
import ExportPanel from './components/ExportPanel';
import ApiServerPanel from './components/ApiServerPanel';
import { FieldConfig, GeneratedData, MockDataConfig } from './types';
import { generateMockData } from './utils/dataGenerator';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const App: React.FC = () => {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [dataCount, setDataCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('preview');

  const handleGenerateData = async () => {
    if (fields.length === 0) {
      message.warning('请至少添加一个字段配置');
      return;
    }

    setLoading(true);
    try {
      const config: MockDataConfig = {
        fields,
        count: dataCount,
        format: 'json'
      };
      
      const data = generateMockData(config);
      setGeneratedData(data);
      message.success(`成功生成 ${data.length} 条数据`);
      setActiveTab('preview'); // 自动切换到预览标签
    } catch (error) {
      message.error('数据生成失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldsChange = (newFields: FieldConfig[]) => {
    setFields(newFields);
  };

  const handleDataCountChange = (count: number) => {
    setDataCount(count);
  };

  return (
    <Layout>
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <DatabaseOutlined style={{ fontSize: '24px', color: 'white', marginRight: '12px' }} />
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Mock Data Generator
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginLeft: '16px' }}>
          智能数据模拟生成器
        </Text>
      </Header>
      
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 操作面板 */}
            <Card>
              <Space wrap>
                <Button 
                  type="primary" 
                  icon={<DatabaseOutlined />}
                  onClick={handleGenerateData}
                  loading={loading}
                  size="large"
                >
                  生成数据
                </Button>
                <Text type="secondary">
                  {generatedData.length > 0 ? `已生成 ${generatedData.length} 条数据` : '请配置字段并生成数据'}
                </Text>
              </Space>
            </Card>

            {/* 主要内容区域 */}
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
              {/* 字段配置面板 */}
              <Card title="字段配置" style={{ height: 'fit-content' }}>
                <FieldConfigPanel 
                  fields={fields}
                  dataCount={dataCount}
                  onFieldsChange={handleFieldsChange}
                  onDataCountChange={handleDataCountChange}
                />
              </Card>

              {/* 右侧标签页内容 */}
              <Card>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'preview',
                      label: (
                        <span>
                          <DatabaseOutlined />
                          数据预览
                        </span>
                      ),
                      children: <DataPreview data={generatedData} />
                    },
                    {
                      key: 'export',
                      label: (
                        <span>
                          <DownloadOutlined />
                          数据导出
                        </span>
                      ),
                      disabled: generatedData.length === 0,
                      children: <ExportPanel data={generatedData} />
                    },
                    {
                      key: 'api',
                      label: (
                        <span>
                          <ApiOutlined />
                          Mock API
                        </span>
                      ),
                      children: <ApiServerPanel data={generatedData} />
                    }
                  ]}
                />
              </Card>
            </div>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default App;