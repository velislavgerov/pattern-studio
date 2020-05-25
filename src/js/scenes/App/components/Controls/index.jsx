import React from 'react';
import { getBase64, getTextFile } from 'js/misc';

import {
  Form,
  Col,
  Row,
  Button,
  List,
  Card,
  Upload,
  Tabs,
  Radio,
  Popover,
  Space,
  Tag,
} from 'antd';

import {
  SelectOutlined,
  DeleteOutlined,
  UploadOutlined,
  RetweetOutlined,
  ClearOutlined,
  CopyOutlined,
  FileAddOutlined,
  GroupOutlined,
  CloseSquareOutlined,
  CrownOutlined,
  BgColorsOutlined,
  FieldStringOutlined,
  PictureOutlined,
  TableOutlined,
  FileImageOutlined,
  ImportOutlined,
  ExportOutlined,
  PrinterOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';

import { SketchPicker, CirclePicker } from 'react-color';

const {
  TabPane
} = Tabs;

class Controls extends React.Component {
  state = {
    color: '#ffffff',
    colors: ['#ffffff'],
  };

  handleChangeColor = (color) => {
    this.setState({
      color: color.hex.toLowerCase(),
    })
  }

  handleAddColor = () => {
    this.setState(state => {
      if (state.colors.includes(state.color)) return;
      return {
        colors: [...state.colors, state.color],
      }
    });
  }

  handleDeleteColor = (colorIndex) => {
    this.setState(state => {
      if (state.colors[colorIndex] == null) return;
      let colors = [...state.colors];
      return {
        colors,
      };
    });
  }

  handleSelectColor = (colorIndex) => {
    const { colors } = this.state;
    const color = colors[colorIndex];
    if (color == null) return;
    this.props.onBgColorChange(color);
  }

  render () {
    const {
      color,
      colors
    } = this.state;

    return (
      <Form
        layout="vertical"
        hideRequiredMark
        ref={this.formRef}
        name="form-control-ref"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h4>Canvas Controls</h4>   
            <Upload
              multiple={false}
              accept="application/json"
              transformFile={async file => {
                file.preview = await getTextFile(file);
                file.json = JSON.parse(file.preview);
              }}
              onChange={this.props.onImport}
              showUploadList={false}
            >
              <Button
                style={{ marginRight: 8 }}
                icon={<ImportOutlined />}
              >
                Import
              </Button>
            </Upload>
            <Button
              onClick={this.props.onExport}
              style={{ marginRight: 8 }}
              icon={<ExportOutlined />}
            >
              Export
            </Button>
            <Button
              onClick={this.props.onPreview}
              style={{ marginRight: 8 }}
              icon={<FileImageOutlined />}
            >
              Preview
            </Button>
            <Button
              onClick={this.props.onDownloadForPrint}
              style={{ marginRight: 8 }}
              icon={<PrinterOutlined />}
            >
              Download for Print
            </Button>
          </Col>
          <Col span={24}>
            <Button
              type="dashed"
              onClick={this.props.onSelectAll}
              style={{ marginRight: 8 }}
              icon={<SelectOutlined />}
            >
              Select All
            </Button>
            <Button
              type="dashed"
              onClick={this.props.onDiscard}
              style={{ marginRight: 8 }}
              icon={<CloseSquareOutlined />}
            >
              Discard
            </Button>
            <Button
              onClick={this.props.onGroup}
              style={{ marginRight: 8 }}
              icon={<GroupOutlined />}
            >
              Group
            </Button>
          </Col>
          <Col span={24}>
            <Button
              onClick={this.props.onClone}
              style={{ marginRight: 8 }}
              icon={<CopyOutlined />}
            >
              Clone
            </Button>
            <Button
              danger
              onClick={this.props.onRemove}
              style={{ marginRight: 8 }}
              icon={<DeleteOutlined />}
            >
              Remove
            </Button>
            <Button
              type="primary"
              danger
              onClick={this.props.onClear}
              style={{ marginRight: 8 }}
              icon={<ClearOutlined />}
            >
              Clear
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h4>Layers</h4>
            <Tabs
              type="editable-card"
              tabPosition="top"
            >
              <TabPane
                tab={
                  <span>
                    <PictureOutlined />
                    Background
                  </span>
                }
                key={1}
                closable={false}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      name="background-type"
                      label="Type"
                    >
                      <Radio.Group defaultValue="color" buttonStyle="outlined" style={{ marginBottom: 6 }}>
                        <Radio.Button value="color"><BgColorsOutlined /> Color</Radio.Button>
                        <Radio.Button value="pattern" disabled><TableOutlined /> Pattern</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space>
                      <Popover
                        overlayClassName="color-picker-popover"
                        overlayStyle={{antPopoverContent: { padding: 0 }}}
                        placement="bottom"
                        content={<SketchPicker color={color}
                        onChangeComplete={this.handleChangeColor}/>}
                        trigger="click"
                      >
                        <Button icon={<BgColorsOutlined />}>Pick</Button>
                      </Popover>
                      <Button
                        icon={<PlusCircleOutlined />}
                        onClick={this.handleAddColor}
                        disabled={colors.includes(color.toLowerCase())}
                      >
                        Add
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {colors.map((color, index) => {
                      return <Tag
                        closable
                        onClose={() => this.handleDeleteColor(index)}
                        onClick={() => this.handleSelectColor(index)}
                        key={`${index}-${color}`}
                        color={color.toLowerCase() === '#ffffff' ? null : color}
                      >
                        {color}
                      </Tag>
                    })}
                  </Col>
                </Row>
              </TabPane>
              <TabPane
                 tab={
                  <span>
                    <CrownOutlined />
                    Sticker Group
                  </span>
                }
                key={2}
                closable={true}
              >
                <Col span={24}>
                  <Form.Item
                    name="sources"
                    label="Sources"
                  >
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
                        <UploadOutlined /> Load File(s)
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <List
                    grid={{ column: 6, gutter: 6 }}
                    dataSource={this.props.fileList}
                    renderItem={item => {
                      return (
                        <List.Item>
                          <Card
                            selected
                            style={{width: 'auto', height: 'auto'}}
                            bodyStyle={{ display: 'none' }}
                            hoverable
                            actions={[
                              <FileAddOutlined key="select" onClick={() => this.props.onAddSVGElement({ item })} />,
                              <RetweetOutlined key="swap" onClick={() => this.props.onSwapSVGElement({ item })}/>,
                              <DeleteOutlined key="delete" onClick={() => this.props.onFileListRemoveItem({ item })} />,
                            ]}
                            cover={<img style={{ maxHeight: 128, padding: 6 }} src={item.preview}/>}
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Col>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <FieldStringOutlined />
                    Text Group
                  </span>
                }
                key={3}
                closable={true}
              >
                <Col span={24}>
                  <Button
                    type="primary"
                    icon={<FileAddOutlined />}
                    onClick={this.props.onAddTextElement}
                  >
                    Add Text
                  </Button>
                </Col>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Controls;