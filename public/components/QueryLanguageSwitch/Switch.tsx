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
    "data-test-subj":'switch-button-sql'
  },
  {
    id: 'PPL',
    label: 'PPL',
    "data-test-subj":'switch-button-ppl'
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
        data-test-subj='switch-button'
        className="query-language-switch"
        legend="query-language-swtich"
        options={toggleButtons}
        onChange={(id) => this.props.onChange(id)}
        idSelected={this.props.language}
        buttonSize="s"
        isDisabled={this.props.asyncLoading}
      />
    );
  }
}

export default Switch;
