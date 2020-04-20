import React from 'react';

import {
  Layout,
  Menu,
  PageHeader
} from 'antd';

import {
  GroupOutlined,
  BgColorsOutlined,
  PlusOutlined,
  PictureOutlined,
  FieldStringOutlined,
  CrownOutlined
} from '@ant-design/icons';

const {
  Content,
  Footer,
  Sider
} = Layout;

import Canvas from './components/Canavs';
import GroupForm from './components/GroupForm';
import Controls from './components/Controls';

class App extends React.Component {
  state = {
    groupFormVisible: false
  };

  showGroupForm = () => {
    this.setState({
      groupFormVisible: true,
    });
  };

  onGroupFormClose = () => {
    this.setState({
      groupFormVisible: false,
    });
  };
  
  onGroupFormSubmit = (e) => {
    console.log(e);
  };

  render () {
    return (
      <React.Fragment>
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
          <Menu
            theme="dark"
            mode="inline"
            defaultOpenKeys={['sub1', 'sub2']}
           >
            <Menu.Item onClick={this.showGroupForm}>
              <PlusOutlined />
              <span>New Group</span>
            </Menu.Item>
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
                <CrownOutlined />
                <span>Sticker Group 01</span>
              </Menu.Item>
              <Menu.Item key="2">
                <FieldStringOutlined />
                <span>Text Group 01</span>
              </Menu.Item>
              <Menu.Item key="3">
                <PictureOutlined />
                <span>Background</span>
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
              <Menu.Item key="4">
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
          <Layout>
            <Content style={{ margin: '24px 16px 0' }}>
              <div className="app-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <Canvas />
              </div>
            </Content>
          </Layout>
          <Footer style={{ textAlign: 'center' }}>Created with ❤️ by <a href="https://gerov.dev">thunderstruck47</a></Footer>
          </Layout>
        </Layout>
        <GroupForm visible={this.state.groupFormVisible} onClose={this.onGroupFormClose} onSubmit={this.onGroupFormSubmit} />
      </React.Fragment>
    );
  }
}

export default App;