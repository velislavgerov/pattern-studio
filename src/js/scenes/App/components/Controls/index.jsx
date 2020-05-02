import React from 'react';

import { getBase64 } from 'js/misc';

import {
  Form,
  Col,
  Row,
  Input,
  Button,
  List,
  Card,
  Upload,
} from 'antd';


import { EditOutlined, SelectOutlined, DeleteOutlined, EllipsisOutlined, SettingOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import PicturesWall from '../PicturesWall';

class Controls extends React.Component {
  render () {
    return (
      <>
        <Row gutter={16}>
          <Col span={24}>
            <h4>Canvas Controls</h4>
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
          </Col>
          <Col span={24}>
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
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Form.Item
                      name="sources"
                      label="Sources"
                    >
                  <Col span={24}>
                    <Upload
                      multiple
                      accept="image/svg+xml"
                      fileList={this.props.fileList}
                      transformFile={async file => {
                        file.preview = await getBase64(file);
                      }}
                      onChange={this.props.onFileListChange}
                      showUploadList={false}
                    >
                      <Button>
                        <UploadOutlined /> Select File
                      </Button>
                    </Upload>
                    </Col>
                    <Col span={24}>
                    
                  </Col>
                </Form.Item>
              </Row>
            </Form>
          </Col>
          <Col span={24}>
          <List
                      grid={{ column: 6, gutter: 6 }}
                      dataSource={this.props.fileList}
                      renderItem={item => {
                        console.log(item);
                        return (
                          <List.Item>
                            <Card
                              selected
                              style={{width: 'auto', height: 'auto'}}
                              hoverable
                              actions={[
                                <SelectOutlined key="select" onClick={() => this.props.onAddSVGElement({ item })} />,
                                <DeleteOutlined key="delete" onClick={() => this.props.onFileListRemoveItem({ item })} />,
                              ]}
                              cover={<img src={item.preview}/>}
                            ></Card>
                          </List.Item>
                        );
                      }}
                    />
          </Col>
        </Row>
      </>
    );
  }
}

export default Controls;