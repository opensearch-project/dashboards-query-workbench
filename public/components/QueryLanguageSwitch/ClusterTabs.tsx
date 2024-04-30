/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonGroup } from '@elastic/eui';
import React from 'react';

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
    id: 'Data source Connections',
    label: 'Data source Connections',
  },
];

class ClusterTabs extends React.Component<SwitchProps> {
  constructor(props: SwitchProps) {
    super(props);
    this.state = {
      cluster: 'Data source Connections',
    };
  }

  render() {
    return (
      <EuiButtonGroup
        legend='cluster-selector'
        options={toggleButtons}
        onChange={(id) => this.props.onChange(id)}
        idSelected={this.props.cluster}
        buttonSize="s"
        isDisabled={this.props.asyncLoading}
      />
    );
  }
}

export default ClusterTabs;