import React from 'react';

import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Radio,
} from 'antd';

import PicturesWall from '../PicturesWall';

class GroupForm extends React.Component {
  formRef = React.createRef();

  state = {
    type: 'text'
  };

  handleTypeChange = e => {
    this.setState({ type: e.target.value });
  };

  render() {
    return (
      <Drawer
        title="Create a new group"
        width={720}
        onClose={this.props.onClose}
        visible={this.props.visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button
              onClick={this.props.onClose}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button onClick={this.props.onSubmit} type="primary">
              Submit
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          hideRequiredMark
          ref={this.formRef}
          name="form-control-ref"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter group name' }]}
              >
                <Input placeholder="Please enter group name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please choose the type' }]}
              >
                <Radio.Group onChange={this.handleTypeChange} value={this.state.type}>
                  <Radio.Button value="text">Text</Radio.Button>
                  <Radio.Button value="sticker">Sticker</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          {this.state.type === 'sticker' &&
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="stickers"
                  label="Stickers"
                >
                  <PicturesWall />
                </Form.Item>
              </Col>
            </Row>
          }
        </Form>
      </Drawer>
    );
  }
};

export default GroupForm;