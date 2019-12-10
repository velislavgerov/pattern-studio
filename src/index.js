import React from 'react';
import ReactDOM from 'react-dom';
import { PageHeader } from 'antd';
import "antd/dist/antd.css";

import Canvas from './js/components/Canvas.jsx';


ReactDOM.render(
  <React.Fragment>
    <PageHeader
      style={{
        border: '1px solid rgb(235, 237, 240)',
      }}
      title="Pattern Studio"
      subTitle="An experimental pettern design and print tool."
    />
    <Canvas />
  </React.Fragment>,
  document.getElementById('root')
);
  