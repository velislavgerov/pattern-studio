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
  Button,
} from 'antd';

import {
  PrinterOutlined,
} from '@ant-design/icons';

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

const resizeHandler = (event) => {
  if (event.target != null) {
    event.target.canvas.getObjects()
      .filter(obj => obj.id === event.target.id && obj !== event.target)
      .map(obj => {
        obj.set({
          width: event.target.width,
          height: event.target.height,
          scaleX: event.target.scaleX,
          scaleY: event.target.scaleY,
        });
        obj.setCoords();
        event.target.canvas.requestRenderAll();
      });
  }
  

  mirrorHandler(event);
}

const mirrorHandler = (event) => {
  if (event.target != null) {
    const coords = event.target.aCoords;

    const min = 0;
    const max = 600;

    const tlOut = (coords.tl.x <= min || coords.tl.y <= min || coords.tl.x >= max || coords.tl.y >= max);
    const trOut = (coords.tr.x <= min || coords.tr.y <= min || coords.tr.x >= max || coords.tr.y >= max);
    const brOut = (coords.br.x <= min || coords.br.y <= min || coords.br.x >= max || coords.br.y >= max);
    const blOut = (coords.bl.x <= min || coords.bl.y <= min || coords.bl.x >= max || coords.bl.y >= max);

    const target = event.target;
    const canvas = event.target.canvas;
    const rest = canvas.getObjects().filter(obj => obj.id === target.id && obj !== target);

    if (tlOut && trOut && brOut && blOut) {
      rest.map(obj => {
        canvas.remove(obj);
      });
      
      canvas.requestRenderAll();

      return;
    }
    
    let positions = [
      {
        top: target.top,
        left: target.left,
      }
    ];

    if (tlOut && blOut) {
      positions.push({
        top: target.top,
        left: target.left + max,
      });
      console.log('tlbl');
    }
    
    if (tlOut && trOut) {
      positions = positions.concat(
        positions.map(pos => {
          return {
            top: pos.top + max,
            left: pos.left,
          }
        })
      );
      console.log('tltr');
    }
    
    if (trOut && brOut) {
      positions = positions.concat(
        positions.map(pos => {
          return {
            top: pos.top,
            left: pos.left - max,
          }
        })
      );
      console.log('trbr');
    }
    
    if (brOut && blOut) {
      positions = positions.concat(
        positions.map(pos => {
          return {
            top: pos.top - max,
            left: pos.left,
          }
        })
      );
      console.log('brbl');
    }

    positions.forEach((pos, i) => {
      console.log(pos, i);
      if (i === 0 && positions.length === 1) {
        rest.map(obj => {
          canvas.remove(obj);
        });

        return;
      } else if (i === 0) {
        return;
      }

      if (rest[i - 1] != undefined) {
        rest[i - 1].set({
          top: pos.top,
          left: pos.left,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          dirty: true,
        });
        rest[i - 1].setCoords();
      } else {
        target.clone(clone => {
          canvas.add(clone.set({
            id: target.id,
            guuid: target.guuid,
            top: pos.top,
            left: pos.left,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
          }).setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
          }));
        });
      }
      
      if (i === positions.length - 1) {
        rest.slice(i).map(obj => {
          canvas.remove(obj);
        });
      };
    });

    console.log(canvas);
    
    canvas.requestRenderAll();
  }
}

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
    }, {
      guuid: uuidv4(),
      title: 'Sticker',
      type: 'sticker',
      colors: [],
      sources: [],
    }, {
      guuid: uuidv4(),
      title: 'Text',
      type: 'text',
      colors: [],
      sources: [],
    }],
  };

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setHeight(600);
    this.canvas.setWidth(600);
    this.canvas.on({
      'object:moving': mirrorHandler,
      'object:scaling': resizeHandler,
    });
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

  handleFileUpload = ({ file, groupIndex }) => {
    console.log(file);
    this.setState(state => update(state, {
        groups: {
          [groupIndex]: {
            sources: {
              $push: [{
                name: file.name,
                preview: file.preview,
                uid: file.uid,
                lastModified: file.lastModified,
                type: file.type,
              }]
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
    }, () => this.handlePreview());
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

    const dataURL = changeDpiDataUrl(this.canvas.toDataURL({
      enableRetinaScaling: true,
      multiplier: scaleValue,
    }), 300);

    const previewCanvas = new fabric.StaticCanvas();
    previewCanvas.setHeight(1015);
    previewCanvas.setWidth(724);

    previewCanvas.backgroundColor = new fabric.Pattern({
        source: dataURL,
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
    
    downloadDataURL('data:image/svg+xml;utf8,' + encodeURIComponent(this.canvas.toSVG()), 'pattern.svg');
    
    const dataURL = this.canvas.toDataURL({
      enableRetinaScaling: false,
      multiplier: scaleValue,
    });

    const previewCanvas = new fabric.StaticCanvas();
    previewCanvas.setHeight(9449);
    previewCanvas.setWidth(7087);

    previewCanvas.backgroundColor = new fabric.Pattern({
        source: dataURL,
        repeat: 'repeat',
      }, () => {
        previewCanvas.renderAll();
        const previewCanvasPNGURL = previewCanvas.toDataURL({
          enableRetinaScaling: false,
          format: 'png',
          multiplier: 1,
          width: 7087,
          height: 9449,
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
      id: uuidv4(),
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
          id: 'svg_' + Math.random().toString(36).substr(2, 9),
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
      canvas.requestRenderAll();
    }
  }

  handleRemoveBackgroundPattern = () => {
    const canvas = this.canvas;
    
    console.log('here', canvas);
    const backgroundPattern = canvas.backgroundPattern;
    const backgroundColor = canvas.backgroundColor;
    if (backgroundPattern != null) {
      const color = backgroundPattern.color;
      canvas.backgroundPattern = null;
      this.handleBackgroundColorChange(color);
    } else {
      this.handleBackgroundColorChange(backgroundColor);
    }
  }

  handleSetBackgroundPattern = ({file, color, padding, width, offsetX, offsetY, angle, repeat}) => {
    const canvas = this.canvas;
    const { preview } = file;
    if (preview == null) return;
    if (color == null) {
      color = canvas.backgroundPattern != null ? canvas.backgroundPattern.color : canvas.backgroundColor;
    };

    padding = (padding != null) ? padding : 0;
    width = (width != null) ? width : 0;
    offsetX = (offsetX != null) ? offsetX : 0;
    offsetY = (offsetY != null) ? offsetY : 0;
    angle = (angle != null) ? angle : 0;

    fabric.loadSVGFromURL(preview, function(objects, options) {
      const svg = fabric.util.groupSVGElements(objects, options);
      svg.scaleToWidth(width);
      svg.set('angle', angle);
      const patternSourceCanvas = new fabric.StaticCanvas();
      patternSourceCanvas.setBackgroundColor(color);
      patternSourceCanvas.add(svg);
      patternSourceCanvas.setDimensions({
        width: svg.getScaledWidth() + padding,
        height: svg.getScaledHeight() + padding
      });
      patternSourceCanvas.centerObject(svg);
      svg.setCoords();
      patternSourceCanvas.renderAll();
      canvas.backgroundColor = new fabric.Pattern({
        source: patternSourceCanvas.toDataURL(),
        repeat: repeat ? 'repeat' : 'no-repeat',
        offsetX,
        offsetY
      }, () => {
        canvas.renderAll();
      });
    });
    
    canvas.backgroundPattern = {
      file,
      color,
      width,
      padding,
      offsetX,
      offsetY,
      angle,
      repeat
    };
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

    if (canvas.backgroundPattern != null) {
      canvas.backgroundPattern.color = color;
      this.handleSetBackgroundPattern(canvas.backgroundPattern)
    } else {
      canvas.backgroundColor = color;
      canvas.requestRenderAll();
    }
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
    console.log('groups', groups);

    canvas.backgroundColors = backgroundColors;
    canvas.groups = groups;
    canvas.groups.filter(group => group.type === 'text').map(group => {
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
    
    download(JSON.stringify(this.canvas.toJSON(['backgroundColors', 'groups', 'backgroundPattern'])), 'pattern.json', 'application/json');
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
              onSetBackgroundPattern={this.handleSetBackgroundPattern}     
              onRemoveBackgroundPattern={this.handleRemoveBackgroundPattern}
              onAddSVGElement={this.handleAddSVGElement}
              onClear={this.handleClear}
              onClone={this.handleClone}
              onRemove={this.handleRemove}
              onDiscard={this.handleDiscard}
              onGroup={this.handleGroup}
              onFileUpload={this.handleFileUpload}
              onFileListRemoveItem={this.handleGroupSourcesRemoveItem}
              onBackgroundColorChange={this.handleBackgroundColorChange}
              onAddTextElement={this.handleAddTextElement}
              onSwapSVGElement={this.handleSwapGroupSource}
              onPreview={this.handlePreview}
              onImport={this.handleImport}
              onExport={this.handleExport}
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
            <Col span={6}>
              <InputNumber
                min={0}
                max={2}
                style={{ margin: '0 16px' }}
                step={0.01}
                value={scaleValue}
                onChange={this.handleScaleValueChange}
              />
            </Col>
            <Col span={6}>
              <Button
                onClick={this.handleDownloadForPrint}
                icon={<PrinterOutlined />}
              >
                Download
              </Button>
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