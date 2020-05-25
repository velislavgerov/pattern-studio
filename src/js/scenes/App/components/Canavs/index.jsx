import React from 'react';
import { fabric } from 'fabric';
import { changeDpiDataUrl } from 'changedpi';

import {
  Row,
  Col,
  Modal,
  Slider,
  InputNumber,
} from 'antd';

import { getBase64, download, downloadDataURL } from 'js/misc';
import Controls from '../Controls';

fabric.Object.prototype.set({
  cornerStyle: 'square',
  centeredScaling: true,
  centeredRotation: true,
  transparentCorners: false,
  objectCaching: false,
  lockScalingFlip: true,
  originX: 'center',
  originY: 'center',
})

class Canvas extends React.Component {
  state = {
    fileList: [],
    previewImage: '',
    previewVisible: false,
    scaleValue: 1.00,
  };

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setHeight(600);
    this.canvas.setWidth(600);
  };

  handleFileListChange = ({ fileList }) => this.setState({ fileList });

  handleScaleValueChange = value => {
    if (isNaN(value)) {
      return;
    }
    this.setState({
      scaleValue: value,
    }, this.handlePreview());
  }

  handleFileListRemoveItem = ({ item }) => {
    this.setState((state) => {
      return {
        fileList: state.fileList.filter((file) => file.uid !== item.uid),
      };
    });
  };

  handlePreview = () => {
    const { scaleValue } = this.state;

    const svg = this.canvas.toSVG({
      width: this.canvas.width * scaleValue,
      height: this.canvas.height * scaleValue,
    })
    const svgDataURL = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    const previewCanvas = new fabric.StaticCanvas();
    previewCanvas.setHeight(1015);
    previewCanvas.setWidth(724);

    previewCanvas.backgroundColor = new fabric.Pattern({
        source: svgDataURL,
        repeat: 'repeat',
      }, () => {
        previewCanvas.renderAll();
        const previewCanvasSvgURL = 'data:image/svg+xml;utf8,' + encodeURIComponent(previewCanvas.toSVG());
        
        this.setState({
          previewImage: previewCanvasSvgURL,
          previewVisible: true,
        })
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });


  handleDownloadForPrint = () => {
    const { scaleValue } = this.state;

    const svg = this.canvas.toSVG({
      width: this.canvas.width * scaleValue,
      height: this.canvas.height * scaleValue,
    })
    const svgDataURL = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    const previewCanvas = new fabric.StaticCanvas();
    previewCanvas.setHeight(9449);
    previewCanvas.setWidth(7087);

    previewCanvas.backgroundColor = new fabric.Pattern({
        source: svgDataURL,
        repeat: 'repeat',
      }, () => {
        previewCanvas.renderAll();
        const previewCanvasPNGURL = previewCanvas.toDataURL({
          format: 'png',
          multiplier: 1
        });

        downloadDataURL(changeDpiDataUrl(previewCanvasPNGURL, 300), 'pattern.png');
    });
  };

  handleClear = () => {
    this.canvas.clear();
  }

  handleAddSVGElement = async ({ item }) => {
    const canvas = this.canvas;
    if (item == null) return;

    const previewImage = (item.preview != null) ? item.preview : await getBase64(item.originFileObj);

    fabric.loadSVGFromURL(previewImage, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
      svg.set({
        id: 'svg_' + Math.random().toString(36).substr(2, 9)
      });
      canvas.add(svg.set({
          top: 300,
          left: 300,
        }).setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
        })
      );
      canvas.requestRenderAll();
    });
  }

  handleSwapSVGElement = async ({ item }) => {
    const canvas = this.canvas;
    if (item == null) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj == null) return;
    
    const previewImage = (item.preview != null) ? item.preview : await getBase64(item.originFileObj);
    fabric.loadSVGFromURL(previewImage, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
    
      canvas.getObjects().filter(obj => obj.id === activeObj.id).map(obj => {
        canvas.remove(obj);
        svg.clone(clone => {
          canvas.add(clone.set({
            id: obj.id,
            top: obj.top,
            left: obj.left,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
          }).setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
          }));

          if (JSON.stringify(obj) === JSON.stringify(activeObj)) {
            canvas.setActiveObject(clone);
          };
        });
      });
      
      canvas.requestRenderAll();
    });
  }

  handleAddTextElement = () => {
    const canvas = this.canvas;
    const textObj = new fabric.IText('Text', {
        left: 300,
        top: 300,
      }).setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      }
    );
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
  }

  handleClone = () => {
    const canvas = this.canvas;
    const activeObjs = canvas.getActiveObject();

    if (activeObjs != null) {
      activeObjs.clone((clone) => {
        canvas.add(clone.set({
          id: activeObjs.id,
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

  handleBgColorChange = (color) => {
    const canvas = this.canvas;
    canvas.backgroundColor = color;
    canvas.requestRenderAll();
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

  handleImport = ({ file }) => {
    console.log(file);
    this.canvas.loadFromJSON(file.json)
  };

  handleExport = () => {
    download(JSON.stringify(this.canvas.toJSON()), 'pattern.json', 'application/json');
  };

  render () {
    const { previewVisible, previewImage, scaleValue } = this.state;
    return (
      <div>
        <Row gutter={16}>
          <Col md={24} lg={12}>
            <h4>Canvas</h4>
            <canvas id="canvas"></canvas>
          </Col>
          <Col md={24} lg={12}>
            <Controls
              id="canvas-controls"
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
              onBgColorChange={this.handleBgColorChange}
              onAddTextElement={this.handleAddTextElement}
              onSwapSVGElement={this.handleSwapSVGElement}
              onPreview={this.handlePreview}
              onImport={this.handleImport}
              onExport={this.handleExport}
              onDownloadForPrint={this.handleDownloadForPrint}
            />
          </Col>
        </Row>
        <Modal
          visible={previewVisible}
          title="Preview"
          footer={null}
          onCancel={this.handleCancel}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Slider
                min={0}
                max={2}
                onChange={this.handleScaleValueChange}
                value={typeof scaleValue === 'number' ? scaleValue : 0}
                step={0.01}
              />
            </Col>
            <Col span={4}>
              <InputNumber
                min={0}
                max={2}
                style={{ margin: '0 16px' }}
                step={0.01}
                value={scaleValue}
                onChange={this.handleScaleValueChange}
              />
            </Col>
          </Row>
          <Row>
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          </Row>
        </Modal>
      </div>
    );
  }
};

export default Canvas;