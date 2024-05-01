/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';
import { fetchDataSources } from '../../../common/utils/fetch_datasources';

interface CustomView {
  http: CoreStart['http'];
  onSelect: (selectedItems: []) => void;
  urlDataSource: string;
  asyncLoading: boolean;
  dataSourceMDSId: string;
}

export const DataSelect = ({ http, onSelect, urlDataSource, asyncLoading, dataSourceMDSId }: CustomView) => {
  const [selectedOptions, setSelectedOptions] = useState<EuiComboBoxOptionOption[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchDataSources(http, dataSourceMDSId, urlDataSource, (dataOptions, urlSourceFound) => {
      setOptions(dataOptions);
      if (urlSourceFound) {
        setSelectedOptions([{ label: urlDataSource }]);
        onSelect([{ label: urlDataSource }]);
      }
    }, (error) => {
      console.error('Error fetching data sources:', error);
    });
  }, [http, dataSourceMDSId, urlDataSource, onSelect]);

  const handleSelectionChange = (selectedItems: any[]) => {
    if (selectedItems.length > 0) {
      setSelectedOptions(selectedItems);
      onSelect(selectedItems);
    }
  };
  
  return (
    options.length > 0 && (
      <EuiComboBox
        placeholder='Select data source connection'
        singleSelection={{ asPlainText: true }}
        isClearable={false}
        options={options}
        selectedOptions={selectedOptions}
        onChange={(selectedItems) => handleSelectionChange(selectedItems)}
        isDisabled={asyncLoading}
      />
    )
  );
};
