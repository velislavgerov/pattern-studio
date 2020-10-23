import React, { useEffect, useState, Fragment } from 'react';
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
  Modal,
  Input,
  InputNumber,
  Checkbox,
} from 'antd';

import {
  SelectOutlined,
  CloseOutlined,
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
    visible: false,

  };

  handleChangeColor = (color) => {
    this.setState({
      color: color.hex.toLowerCase(),
    });
    this.props.onBackgroundColorChange(color.hex.toLowerCase());
  }

  handleAddText = (values) => {
    console.log('handleAddText', values);
    Object.keys(values).forEach(key => values[key] === undefined && delete values[key]);
    this.props.onAddTextElement(values);
  }

  handleAddTextGroup = () => {
    // todo promise resolve Modal
    this.props.onAddGroup({
      title: 'Text',
      type: 'text',
    });

    this.setState({
      visible: false,
    });
  }

  handleAddStickerGroup = () => {
    this.setState({
      visible: false,
    });

    this.props.onAddGroup({
      title: 'Sticker',
      type: 'sticker',
    });
  }
  
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    this.setState({
      visible: true,
    })
  }

  remove = targetKey => {
    this.props.onRemoveGroup({ groupIndex: targetKey });
  }

  render () {
    const {
      color,
    } = this.state;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h4>Controls</h4>   
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
              onEdit={this.onEdit}
              onChange={this.props.onGroupIndexChange}
            >
              {this.props.groups.map((group, index) => {
                if (group.type === 'background') {
                  return (
                    <TabPane
                      tab={
                        <span>
                          <PictureOutlined />
                          {group.title}
                        </span>
                      }
                      key={index}
                      closable={group.type !== 'background'}
                    >
                      <BackgroundGroup group={group} groupIndex={index} {...this.props} />
                    </TabPane>
                  );
                } else if (group.type === 'sticker') {
                  return (
                    <TabPane
                      tab={
                        <span>
                          <CrownOutlined />
                          {group.title}
                        </span>
                      }
                      key={index}
                      closable={group.type !== 'background'}
                    >
                      <Col span={24}>
                        <Upload
                          multiple
                          beforeUpload={async (file) => {
                            file.preview = await getBase64(file);
                            this.props.onFileUpload({file, groupIndex: index});
                            return Promise.reject();
                          }}
                          accept="image/svg+xml"
                          fileList={group.sources}
                          showUploadList={false}
                        >
                          <Button>
                            <UploadOutlined /> Load File(s)
                          </Button>
                        </Upload>
                      </Col>
                      <Col span={24}>
                        <List
                          grid={{ column: 6, gutter: 6 }}
                          dataSource={group.sources}
                          renderItem={item => {
                            return (
                              <List.Item>
                                <Card
                                  selected
                                  style={{width: 'auto', height: 'auto'}}
                                  bodyStyle={{ textAlign: 'center', padding: 6 }}
                                  hoverable
                                  actions={[
                                    <FileAddOutlined key="select" onClick={() => this.props.onAddSVGElement({ item })} />,
                                    <RetweetOutlined key="swap" onClick={() => this.props.onSwapSVGElement({ item })}/>,
                                    <DeleteOutlined key="delete" onClick={() => this.props.onFileListRemoveItem({ item })} />,
                                  ]}
                                  cover={<img style={{ maxHeight: 128, padding: 6 }} src={item.preview}/>}
                                >
                                  <Card.Meta description={item.name} />
                                </Card>
                              </List.Item>
                            );
                          }}
                        />
                      </Col>
                    </TabPane>
                  );
                } else if (group.type === 'text') {
                  return (
                    <TabPane
                      tab={
                        <span>
                          <FieldStringOutlined />
                          {group.title}
                        </span>
                      }
                      key={index}
                      closable={group.type !== 'background'}
                    >
                      <Col span={24}>
                        <TextForm
                          group={group}
                          guuid={group.guuid}
                          onAddText={this.handleAddText}
                          onUpdateTextElement={this.props.onUpdateTextElement}
                        />
                      </Col>
                    </TabPane>
                  );
                }
              })}
            </Tabs>
            <Modal
              title="Add Element Group"
              visible={this.state.visible}
              width={256}
              bodyStyle={{
                display: 'none',
              }}
              footer={[
                <Button key="sticker" onClick={this.handleAddStickerGroup}>
                  Sticker Group
                </Button>,
                <Button key="text" onClick={this.handleAddTextGroup}>
                  Text Group
                </Button>,
              ]}
            >
            </Modal>
          </Col>
        </Row>
      </div>
    );
  }
}

const BackgroundGroup = (props) => {
  const [color, setColor] = useState('#ffffff');
  const [width, setWidth] = useState(100);
  const [padding, setPadding] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [repeat, setRepeat] = useState(true);
  const [angle, setAngle] = useState(0);

  const group = props.group;
  const groupIndex = props.groupIndex;

  const handleChangeWidth = (value) => setWidth(value);
  const handleChangePadding = (value) => setPadding(value);
  const handleChangeOffsetX = (value) => setOffsetX(value);
  const handleChangeOffsetY = (value) => setOffsetY(value);
  const handleChangeRepeat = (event) => setRepeat(event.target.checked);
  const handleChangeAngle = (value) => setAngle(value);

  const handleChangeColor = (value) => {
    setColor(value.hex.toLowerCase());
    props.onBackgroundColorChange(value.hex.toLowerCase());
  }

  return (
    <Fragment>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space>
            <h4>Colors</h4>
            <Popover
              overlayClassName="color-picker-popover"
              overlayStyle={{antPopoverContent: { padding: 0 }}}
              placement="bottom"
              content={<SketchPicker color={color}
              onChangeComplete={handleChangeColor}/>}
              trigger="click"
            >
              <Button icon={<BgColorsOutlined />}>Pick</Button>
            </Popover>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => props.onAddBackgroundColor(color)}
              disabled={props.backgroundColors.includes(color.toLowerCase())}
            >
              Add
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            {props.backgroundColors.map((color, groupIndex) => {
              return <Tag
                closable
                onClose={() => props.onDeleteBackgroundColor(groupIndex)}
                onClick={() => props.onBackgroundColorChange(color)}
                key={`${groupIndex}-${color}`}
                color={color.toLowerCase() === '#ffffff' ? null : color}
              >
                {color}
              </Tag>
            })}
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space>
            <h4>Patterns</h4>
            <Upload
              multiple
              beforeUpload={async (file) => {
                file.preview = await getBase64(file);
                props.onFileUpload({file, groupIndex });
                return Promise.reject();
              }}
              accept="image/svg+xml"
              fileList={group.sources}
              showUploadList={false}
            >
              <Button>
                <UploadOutlined /> Load File(s)
              </Button>
            </Upload>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <h4>Repeat</h4>
            <Checkbox checked={repeat} onChange={handleChangeRepeat} />
            <h4>Width</h4>
            <InputNumber step={1} value={width} onChange={handleChangeWidth}/>
            <h4>Angle</h4>
            <InputNumber step={1} value={angle} onChange={handleChangeAngle}/>
            <h4>Padding</h4>
            <InputNumber step={1} value={padding} onChange={handleChangePadding}/>
            <h4>OffsetX</h4>
            <InputNumber step={1} value={offsetX} onChange={handleChangeOffsetX}/>
            <h4>OffsetY</h4>
            <InputNumber step={1} value={offsetY} onChange={handleChangeOffsetY}/>
          </Space>
        </Col>
        <Col span={24}>
          <List
            grid={{ column: 6, gutter: 6 }}
            dataSource={group.sources}
            renderItem={item => {
              console.log(group);
              return (
                <List.Item>
                  <Card
                    selected
                    style={{width: 'auto', height: 'auto'}}
                    bodyStyle={{ textAlign: 'center', padding: 6 }}
                    hoverable
                    actions={[
                      <SelectOutlined key="select" onClick={() => props.onSetBackgroundPattern({ file: item, width, padding, offsetX, offsetY, repeat, angle })} />,
                      <CloseOutlined key="remove" onClick={() => props.onRemoveBackgroundPattern()}/>,
                      <DeleteOutlined key="delete" onClick={() => props.onFileListRemoveItem({ item })} />,
                    ]}
                    cover={<img style={{ maxHeight: 128, padding: 6 }} src={item.preview}/>}
                  >
                    <Card.Meta description={item.name} />
                  </Card>
                </List.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Fragment>
  );
}

const TextForm = (props) => {
  const [form] = Form.useForm();

  const handleValuesChange = (values) => props.onUpdateTextElement({ guuid: props.guuid, ...values });

  return (
    <Form
      form={form}
      name="add-text"
      labelCol={{
        span: 6
      }}
      wrapperCol={{
        span: 18
      }}
      onFinish={props.onAddText}
      onValuesChange={handleValuesChange}
      initialValues={{
        textAlign: 'left',
        fontFamily: 'Times New Roman',
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: 'normal',
        ...props.group.values,
        guuid: props.guuid,
      }}
    >
      <Form.Item hidden label="Group ID" name="guuid">
        <Input hidden value={props.guuid}/>
      </Form.Item>
      <Form.Item label="Text" name="text"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Text Align" name="textAlign">
        <Radio.Group>
          <Radio.Button value="left">left</Radio.Button>
          <Radio.Button value="center">center</Radio.Button>
          <Radio.Button value="right">right</Radio.Button>
          <Radio.Button value="justify">justify</Radio.Button>
          <Radio.Button value="justify-left">justify-left</Radio.Button>
          <Radio.Button value="justify-center">justify-center</Radio.Button>
          <Radio.Button value="justify-right">justify-right</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Text Background Color" name="textBackgroundColor">
        <Input type="color" allowClear />
      </Form.Item>
      <Form.Item label="Fill" name="fill">
        <Input type="color" allowClear onChange={params => console.log(params)} />
      </Form.Item>
      <Form.Item label="Font Family" name="fontFamily">
        <Input />
      </Form.Item>
      <Form.Item label="Font Size," name="fontSize" rules={[{ type: 'number', min: 0 }]}>
        <InputNumber />
      </Form.Item>
      <Form.Item label="Font Style" name="fontStyle">
        <Radio.Group>
          <Radio.Button value="normal">Normal</Radio.Button>
          <Radio.Button value="italic">Italic</Radio.Button>
          <Radio.Button value="oblique">Oblique</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Font Weight" name="fontWeight">
        <Radio.Group >
          <Radio.Button value="normal">Normal</Radio.Button>
          <Radio.Button value="bold">Bold</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        wrapperCol={{
          offset: 6,
          span: 18,
        }}
      >
        <Button
          type="primary"
          htmlType="submit"
          icon={<FileAddOutlined />}
        >
          Add Text
        </Button>
      </Form.Item>
    </Form>);
}

export default Controls;