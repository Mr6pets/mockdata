import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  List, 
  message, 
  Modal,
  Input,
  Divider,
  Row,
  Col,
  Alert
} from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  ApiOutlined, 
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { GeneratedData } from '../types';
import { mockApiServer } from '../utils/mockApiServer';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

interface ApiServerPanelProps {
  data: GeneratedData[];
}

const ApiServerPanel: React.FC<ApiServerPanelProps> = ({ data }) => {
  const [serverStatus, setServerStatus] = useState(mockApiServer.getStatus());
  const [loading, setLoading] = useState(false);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [postmanModalVisible, setPostmanModalVisible] = useState(false);

  useEffect(() => {
    mockApiServer.setData(data);
    setServerStatus(mockApiServer.getStatus());
  }, [data]);

  const handleStartServer = async () => {
    if (data.length === 0) {
      message.warning('请先生成数据再启动API服务');
      return;
    }

    setLoading(true);
    try {
      const result = await mockApiServer.start();
      if (result.success) {
        message.success(result.message);
        setServerStatus(mockApiServer.getStatus());
      }
    } catch (error) {
      message.error('启动API服务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStopServer = async () => {
    setLoading(true);
    try {
      const result = await mockApiServer.stop();
      if (result.success) {
        message.success(result.message);
        setServerStatus(mockApiServer.getStatus());
      }
    } catch (error) {
      message.error('停止API服务失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const downloadPostmanCollection = () => {
    const collection = mockApiServer.generatePostmanCollection();
    const blob = new Blob([JSON.stringify(collection, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-api-collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Postman集合已下载');
  };

  const endpoints = mockApiServer.getEndpoints();

  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="服务状态" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>状态: </Text>
                <Tag color={serverStatus.isRunning ? 'green' : 'red'}>
                  {serverStatus.isRunning ? '运行中' : '已停止'}
                </Tag>
              </div>
              <div>
                <Text strong>端口: </Text>
                <Text code>{serverStatus.port}</Text>
              </div>
              <div>
                <Text strong>地址: </Text>
                <Text code>{serverStatus.baseUrl}</Text>
                {serverStatus.isRunning && (
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(serverStatus.baseUrl)}
                  />
                )}
              </div>
              <div>
                <Text strong>数据量: </Text>
                <Text>{serverStatus.dataCount} 条</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="服务控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartServer}
                  loading={loading}
                  disabled={serverStatus.isRunning || data.length === 0}
                >
                  启动服务
                </Button>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopServer}
                  loading={loading}
                  disabled={!serverStatus.isRunning}
                >
                  停止服务
                </Button>
              </Space>

              <Space wrap>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setDocModalVisible(true)}
                  disabled={!serverStatus.isRunning}
                >
                  查看文档
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadPostmanCollection}
                  disabled={!serverStatus.isRunning}
                >
                  导出Postman
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {data.length === 0 && (
        <Alert
          message="提示"
          description="请先配置字段并生成数据，然后才能启动Mock API服务"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {serverStatus.isRunning && (
        <Card title="API端点" style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={endpoints}
            renderItem={(endpoint) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(`${serverStatus.baseUrl}${endpoint.path}`)}
                  >
                    复制
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Tag color="blue">{endpoint.method}</Tag>}
                  title={<Text code>{endpoint.path}</Text>}
                  description={endpoint.description}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* API文档模态框 */}
      <Modal
        title="API 文档"
        open={docModalVisible}
        onCancel={() => setDocModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => {
            copyToClipboard(mockApiServer.generateApiDoc());
          }}>
            复制文档
          </Button>,
          <Button key="close" onClick={() => setDocModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <TextArea
          value={mockApiServer.generateApiDoc()}
          rows={20}
          readOnly
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>

      {/* Postman集合预览模态框 */}
      <Modal
        title="Postman 集合预览"
        open={postmanModalVisible}
        onCancel={() => setPostmanModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={downloadPostmanCollection}>
            下载集合
          </Button>,
          <Button key="close" onClick={() => setPostmanModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <TextArea
          value={JSON.stringify(mockApiServer.generatePostmanCollection(), null, 2)}
          rows={15}
          readOnly
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>
    </div>
  );
};

export default ApiServerPanel;