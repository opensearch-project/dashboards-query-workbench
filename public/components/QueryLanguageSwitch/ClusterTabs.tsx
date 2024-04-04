/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonGroup } from '@elastic/eui';
import React from 'react';
// @ts-ignore

interface SwitchProps {
  onChange: (id: string, value?: any) => void;
  cluster: string
  asyncLoading: boolean;
}

const toggleButtons = [
  {
    id: 'Indexes',
    label: 'Indexes',
  },
  {
    id: 'Data Connections',
    label: 'Data Connections',
  },
];

class ClusterTabs extends React.Component<SwitchProps> {
  constructor(props: SwitchProps) {
    super(props);
    this.state = {
      cluster: 'Indexes',
    };
  }

  render() {
    return (
      <EuiButtonGroup
        className="query-language-switch"
        legend="query-language-swtich"
        options={toggleButtons}
        onChange={(id) => this.props.onChange(id)}
        idSelected={this.props.cluster}
        buttonSize="m"
        isDisabled={this.props.asyncLoading}
      />
    );
  }
}

export default ClusterTabs;