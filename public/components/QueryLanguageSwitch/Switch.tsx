/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonGroup } from '@elastic/eui';
import React from 'react';
// @ts-ignore

interface SwitchProps {
  onChange: (id: string, value?: unknown) => void;
  language: string;
  asyncLoading: boolean;
  // Hide the PPL toggle on clusters without PPL (Elasticsearch < 7.9). Defaults to
  // showing PPL so OpenSearch and ES 7.9+ are unaffected.
  hasPpl?: boolean;
}

type SwitchState = Record<string, never>;

const toggleButtons = [
  {
    id: 'SQL',
    label: 'SQL',
    'data-test-subj': 'switch-button-sql',
  },
  {
    id: 'PPL',
    label: 'PPL',
    'data-test-subj': 'switch-button-ppl',
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
    // hasPpl is optional; treat undefined as "show PPL" so existing callers and
    // OpenSearch / ES 7.9+ keep both toggles. Only hide PPL when explicitly false.
    const options =
      this.props.hasPpl === false
        ? toggleButtons.filter((button) => button.id !== 'PPL')
        : toggleButtons;
    return (
      <EuiButtonGroup
        data-test-subj="switch-button"
        className="query-language-switch"
        legend="query-language-swtich"
        options={options}
        onChange={(id) => this.props.onChange(id)}
        idSelected={this.props.language}
        buttonSize="s"
        isDisabled={this.props.asyncLoading}
      />
    );
  }
}

export { Switch };
