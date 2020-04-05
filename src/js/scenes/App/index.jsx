import React from 'react';
import { Layout, Menu, PageHeader } from 'antd';
import { GroupOutlined, BgColorsOutlined, PlusOutlined } from '@ant-design/icons';

const { Content, Footer, Sider } = Layout;

import Canvas from './components/Canavs';

export default function App() {
  return (
    <Layout className="app-layout">
      <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={broken => {
          console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
      }}
      >
      <div className="logo" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
        <Menu.SubMenu
          key="sub1"
          title={
            <span>
              <GroupOutlined />
              <span>Groups</span>
            </span>
          }
        >
          <Menu.Item key="1">
            <PlusOutlined />
            <span>New Group</span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="sub2"
          title={
            <span>
              <BgColorsOutlined />
              <span>Color Schemes</span>
            </span>
          }
        >
          <Menu.Item key="2">
            <PlusOutlined />
            <span>New Color Scheme</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
      </Sider>
      <Layout>
      <PageHeader
        className="app-layout-sub-header-background"
        style={{
            border: '1px solid rgb(235, 237, 240)',
        }}
        title="Pattern Studio"
        subTitle="An experimental pattern design and print tool"
      />
      <Content style={{ margin: '24px 16px 0' }}>
        <div className="app-layout-background" style={{ padding: 24, minHeight: 360 }}>
        content
        <Canvas />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Created with ❤️ by <a href="https://gerov.dev">thunderstruck47</a></Footer>
      </Layout>
    </Layout>
  );
};