import React from 'react';
import update from 'immutability-helper';
import { fabric } from 'fabric';
import { changeDpiDataUrl } from 'changedpi';

import {
  Row,
  Col,
  Modal,
  Slider,
  InputNumber,
} from 'antd';

import { getBase64, download, downloadDataURL, uuidv4 } from 'js/misc';
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

fabric.Object.prototype.toObject = (function(toObject) {
  return function() {
    return fabric.util.object.extend(toObject.call(this), {
      id: this.id,
      guuid: this.guuid,
    });
  };
})(fabric.Object.prototype.toObject);

fabric.Textbox.prototype.toObject = (function(toObject) {
  return function() {
    return fabric.util.object.extend(toObject.call(this), {
      id: this.id,
      guuid: this.guuid,
      text: this.text,
      textAlign: this.textAlign,
      textBackgroundColor: this.textBackgroundColor,
      backgroundColor: this.backgroundColor,
      fill: this.fill,
      fontFamily: this.fontFamily,
      fontStyle: this.fontStyle,
      fontWeight: this.fontWeight,
      fontSize: this.fontSize,
    });
  };
})(fabric.Textbox.prototype.toObject);

class Canvas extends React.Component {
  state = {
    fileList: [],
    previewImage: '',
    previewVisible: false,
    scaleValue: 1.00,
    backgroundColors: [],
    backgroundPatterns: [],
    groupIndex: 0,
    groups: [{
      guuid: uuidv4(),
      title: 'Background',
      type: 'background',
      colors: [],
      patterns: [],
      sources: [],
      closable: false,
    }],
  };

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setHeight(600);
    this.canvas.setWidth(600);
  };

  handleAddGroup = ({ title, type, content }) => {
    this.setState(state => {
      return {
        groups: [...state.groups, {
          guuid: uuidv4(),
          title,
          type,
          content,
          sources: [],
          closable: true, // Better to be inside component logic?
          values: {},
        }],
      };
    });
  }

  handleRemoveGroup = ({ groupIndex }) => {
    this.setState(state => {
      const { groups } = state;
      if (groups[groupIndex] != null) {
        return {
          groups: update(groups, {
            $splice: [[groupIndex, 1]],
          }),
          groupIndex: (groupIndex == groups.length - 1) ? groupIndex - 1 : state.groupIndex
        };
      }
    });
  }

  handleGroupIndexChange = (key) => this.setState({groupIndex: Number.parseInt(key)});

  handleGroupSourcesChange = ({ fileList, index }) => {
    this.setState(state => update(state, {
        groups: {
          [index]: {
            sources: {
              $set: fileList
            }
          }
        }
      })
    );
  }

  handleGroupSourcesRemoveItem = ({ item }) => {
    this.setState(state => {
      let groups = [ ...state.groups ];
      
      if (groups[state.groupIndex] != null) {
        const group = {
          ...groups[state.groupIndex],
          sources: groups[state.groupIndex].sources.filter((file) => file.uid !== item.uid),
        };

        groups[state.groupIndex] = group;
        
        return {
          groups,
        };
      }
    })
  }

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
    const { groups, groupIndex } = this.state;

    if (item == null) return;
    if ( groups[groupIndex] == null) return;

    const guuid = groups[groupIndex].guuid;
    const previewImage = (item.preview != null) ? item.preview : await getBase64(item.originFileObj);

    fabric.loadSVGFromURL(previewImage, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
      svg.set({
        id: 'svg_' + Math.random().toString(36).substr(2, 9),
        guuid,
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

  handleSwapGroupSource = async ({ item }) => {
    const canvas = this.canvas;
    const { groups, groupIndex } = this.state;

    if (item == null) return;
    if (groups[groupIndex] == null) return;

    const activeObj = canvas.getActiveObject();
    
    const previewImage = (item.preview != null) ? item.preview : await getBase64(item.originFileObj);
    fabric.loadSVGFromURL(previewImage, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
    
      canvas.getObjects().filter(obj => obj.guuid === groups[groupIndex].guuid).map(obj => {
        canvas.remove(obj);
        svg.clone(clone => {
          canvas.add(clone.set({
            id: obj.id,
            guuid: obj.guuid,
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

          if (activeObj != null && JSON.stringify(obj) === JSON.stringify(activeObj)) {
            canvas.setActiveObject(clone);
          };
        });
      });
      
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
            guuid: obj.guuid,
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

  handleAddTextElement = (values) => {
    const canvas = this.canvas;
    console.log(canvas);
    const textObj = new fabric.Textbox(values.text, {
      left: 300,
      top: 300,
      ...values,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
  }

  handleUpdateTextElement = (values) => {
    const canvas = this.canvas;
    if (values.guuid == null) return;
    
    canvas.getObjects().filter(obj => obj.guuid === values.guuid).map(obj => {
      obj.set(values);
      canvas.requestRenderAll();
    });
    
  }

  handleClone = () => {
    const canvas = this.canvas;
    const activeObjs = canvas.getActiveObject();

    if (activeObjs != null) {
      activeObjs.clone((clone) => {
        canvas.add(clone.set({
          id: activeObjs.id,
          guuid: activeObjs.guuid,
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
  
  handleAddBackgroundColor = (color) => {
    this.setState(state => {
      if (state.backgroundColors.includes(color)) return;
      return {
        backgroundColors: [...state.backgroundColors, color],
      }
    });
  }

  handleDeleteBackgroundColor = (index) => {
    this.setState(state => {
      if (state.backgroundColors[index] == null) return;
      let backgroundColors = [...state.backgroundColors];
      backgroundColors.splice(index, 1);
      return {
        backgroundColors,
      };
    });
  }

  handleSelectColor = (index) => {
    const { backgroundColors } = this.state;
    const color = backgroundColors[index];
    if (color == null) return;

    this.handleBackgroundColorChange(color);
  }

  handleBackgroundColorChange = (color) => {
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
    this.canvas.loadFromJSON(file.json)
    this.setState({
      backgroundColors: file.json.backgroundColors,
      groups: file.json.groups,
      groupIndex: 0,
    })
  };

  handleExport = () => {
    const { backgroundColors, backgroundPatterns, groups } = this.state;
    const canvas = this.canvas;

    canvas.backgroundColors = backgroundColors;
    canvas.groups = groups;
    groups.filter(group => group.type === 'text').map(group => {
      const match = canvas.getObjects().filter(obj => obj.guuid === group.guuid);
      return {
        ...group,
        values: match.length ? {
          text: match[0].text,
          textAlign: match[0].textAlign,
          textBackgroundColor: match[0].textBackgroundColor,
          backgroundColor: match[0].backgroundColor,
          fill: match[0].fill,
          fontFamily: match[0].fontFamily,
          fontStyle: match[0].fontStyle,
          fontWeight: match[0].fontWeight,
          fontSize: match[0].fontSize,
        } : {},
      }
    })
    
    download(JSON.stringify(this.canvas.toJSON(['backgroundColors', 'groups'])), 'pattern.json', 'application/json');
  };

  render () {
    const {
      previewVisible,
      previewImage,
      scaleValue,
      backgroundColors,
      backgroundPatterns,
      groups,
      groupIndex,
    } = this.state;
    
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
              onFileListChange={this.handleGroupSourcesChange}
              onFileListRemoveItem={this.handleGroupSourcesRemoveItem}
              onBackgroundColorChange={this.handleBackgroundColorChange}
              onAddTextElement={this.handleAddTextElement}
              onSwapSVGElement={this.handleSwapGroupSource}
              onPreview={this.handlePreview}
              onImport={this.handleImport}
              onExport={this.handleExport}
              onDownloadForPrint={this.handleDownloadForPrint}
              onAddBackgroundColor={this.handleAddBackgroundColor}
              onDeleteBackgroundColor={this.handleDeleteBackgroundColor}
              backgroundColors={backgroundColors}
              backgroundPatterns={backgroundPatterns}
              groups={groups}
              onAddGroup={this.handleAddGroup}
              onRemoveGroup={this.handleRemoveGroup}
              onGroupIndexChange={this.handleGroupIndexChange}
              onUpdateTextElement={this.handleUpdateTextElement}
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