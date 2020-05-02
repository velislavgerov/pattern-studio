import React, { useEffect } from 'react';
import { fabric } from 'fabric';

import {
  Row,
  Col,
  Card,
  List,
  Input,
  Avatar,
} from 'antd';

import { getBase64 } from 'js/misc';
import Controls from '../Controls';



fabric.Object.prototype.centeredScaling = true;
fabric.Object.prototype.centeredRotation = true;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.objectCaching = true;

class Canvas extends React.Component {
  state = {
    fileList: [],
    previewImage: null,
  };

  handleFileListChange = ({ fileList }) => this.setState({ fileList });
  handleFileListRemoveItem = ({ item }) => {
    console.log(item.uid);
    this.setState((state) => {
      return {
        fileList: state.fileList.filter((file) => file.uid !== item.uid),
      };
    });
  };

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
    });
  };

  handleClear = () => {
    this.canvas.clear();
  }

  handleAddSVGElement = async ({ item }) => {
    const canvas = this.canvas;
    if (item == null) return;

    console.log(item);
    const previewImage = (item.preview != null) ? item.preview : await getBase64(item.originFileObj);

    fabric.loadSVGFromURL(previewImage, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
      canvas.add(svg.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      }));
      canvas.requestRenderAll();
    });
  }

  handleClone = () => {
    const canvas = this.canvas;
    const activeObjs = canvas.getActiveObject();

    console.log('activeObjs:', activeObjs)

    if (activeObjs != null) {
      activeObjs.clone((clone) => {
        canvas.add(clone.set({
          top: clone.top + 10,
          let: clone.left + 10,
        }).setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
        }));
        canvas.requestRenderAll();
      });
    }
  }
  
  handleRemove = () => {
    const canvas = this.canvas;
    const activeObjects = canvas.getActiveObjects();

    canvas.discardActiveObject();
    if (activeObjects.length) {
      canvas.remove.apply(canvas, activeObjects);
    }
  }

  handleSetBackground = async file => {
    const canvas = this.canvas;
    const { previewImage } = this.state;
    if (previewImage == null) return;

    canvas.backgroundColor = new fabric.Pattern({
        source: previewImage,
        repeat: 'repeat',
      }, () => {
        canvas.renderAll();
    });
  }

  handleSelectAll = () => {
    const canvas = this.canvas;

    if (!canvas.getObjects().length) return;

    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas,
    });
    canvas.setActiveObject(sel.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    }));
    canvas.requestRenderAll();
  }

  handleDiscard = () => {
    const canvas = this.canvas;

    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  handleGroup = () => {
    const canvas = this.canvas;

    if (!canvas.getActiveObject()) {
      return;
    } else if (canvas.getActiveObject().type === 'group') {
      canvas.getActiveObject().toActiveSelection().setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      });
      canvas.requestRenderAll();
    } else if (canvas.getActiveObject().type === 'activeSelection') {
      canvas.getActiveObject().toGroup().setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      });
      canvas.requestRenderAll();
    }
  }

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setHeight(600);
    this.canvas.setWidth(600);
  };

  render () {
    return (
      <Row gutter={16}>
        <Col md={24} lg={12}>
          <h4>Canvas</h4>
          <canvas id="canvas"></canvas>
        </Col>
        <Col md={24} lg={12}>
          <Controls
            id="canvas-controls"
            canvas={this.canvas}
            onPreview={this.handlePreview}
            onSelectAll={this.handleSelectAll}
            onSetBackground={this.handleSetBackground}
            onAddSVGElement={this.handleAddSVGElement}
            onClear={this.handleClear}
            onClone={this.handleClone}
            onRemove={this.handleRemove}
            onDiscard={this.handleDiscard}
            onGroup={this.handleGroup}
            fileList={this.state.fileList}
            onFileListChange={this.handleFileListChange}
            onFileListRemoveItem={this.handleFileListRemoveItem}
          />
        </Col>
      </Row>
    );
  }
};

export default Canvas;