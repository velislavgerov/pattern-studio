import React, { useEffect } from 'react';
import { fabric } from 'fabric';

export default function Canvas() {
  useEffect(() => {
    const canvas = new fabric.Canvas('canvas');
  }, []);

  return <canvas id="canvas"></canvas>
};