/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonGroup } from '@elastic/eui';
import React from 'react';
// @ts-ignore

interface SwitchProps {
  onChange: (id: string, value?: any) => void;
  language: string;
  asyncLoading: boolean;
}

interface SwitchState {
  // language: string
}

const toggleButtons = [
  {
    id: 'SQL',
    label: 'SQL',
  },
  {
    id: 'PPL',
    label: 'PPL',
  },
];

class Switch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: SwitchProps) {
    super(props);
    this.state = {
      language: 'SQL',
    };
  }

  render() {
    return (
      <EuiButtonGroup
        className="query-language-switch"
        legend="query-language-swtich"
        options={toggleButtons}
        onChange={(id) => this.props.onChange(id)}
        idSelected={this.props.language}
        buttonSize="m"
        isDisabled={this.props.asyncLoading}
      />
    );
  }
}

export default Switch;
