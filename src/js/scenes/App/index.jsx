import React from 'react';

import {
  Layout,
  Typography,
} from 'antd';

const {
  Content,
  Footer,
  Header,
} = Layout;

const {
  Title,
} = Typography;

import Canvas from './components/Canavs';

class App extends React.Component {
  render () {
    return (
      <Layout>
        <Header className="header">
          <div className="logo">
            <Title level={3} style={{ color: '#fff' }}>Pattern Studio</Title>
          </div>
        </Header>
        <Content>
          <div className="app-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Canvas />
          </div>
        </Content>
        <Footer className="app-layout-footer">Created with ❤️ by <a href="https://gerov.dev">thunderstruck47</a></Footer>
      </Layout>
    );
  }
}

export default App;