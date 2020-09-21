import React from 'react';

import {
  Form,
  Input,
} from 'antd';

function TextForm() {
  return (
    <Form.Item
      name="text-input"
      label="Text Input"
    >
      <Input.TextArea
        placeholder="Please enter text input"
        autoSize={{ minRows: 2, maxRows: 4 }}
      />
    </Form.Item>
  );
}