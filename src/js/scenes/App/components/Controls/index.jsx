import React from 'react';

import {
  Form,
  Col,
  Row,
  Input,
  Button,
} from 'antd';

import PicturesWall from '../PicturesWall';

class Controls extends React.Component {
  render () {
    return (
      <div>
        <h4>Element Group</h4>
        <Form
          layout="vertical"
          hideRequiredMark
          ref={this.formRef}
          name="form-control-ref"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter group name' }]}
              >
                <Input placeholder="Please enter group name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Controls"
              >
                <Button
                  onClick={this.props.onAddSVGElement}
                  style={{ marginRight: 8 }}
                  type="primary"
                >
                  Add
                </Button>
                <Button
                  onClick={this.props.onClone}
                  style={{ marginRight: 8 }}
                >
                  Clone
                </Button>
                <Button
                  onClick={this.props.onRemove}
                  style={{ marginRight: 8 }}
                >
                  Remove
                </Button>
                <Button
                  onClick={this.props.onSelectAll}
                  style={{ marginRight: 8 }}
                >
                  Select All
                </Button>
                <Button
                  onClick={this.props.onGroup}
                  style={{ marginRight: 8 }}
                >
                  Group
                </Button>
                <Button
                  onClick={this.props.onDiscard}
                  style={{ marginRight: 8 }}
                >
                  Discard
                </Button>
                <Button
                  onClick={this.props.onClear}
                  style={{ marginRight: 8 }}
                >
                  Clear
                </Button>
                <Button
                  onClick={this.props.onSetBackground}
                  style={{ marginRight: 8 }}
                >
                  Set Background
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="sources"
                label="Sources"
              >
                <PicturesWall
                  fileList={this.props.fileList}
                  onFileListChange={this.props.onFileListChange}
                  onPreview={this.props.onPreview}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default Controls;