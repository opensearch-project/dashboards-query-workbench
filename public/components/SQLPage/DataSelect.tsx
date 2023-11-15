/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';

interface CustomView {
  http: CoreStart['http'];
  onSelect: (selectedItems: []) => void;
  urlDataSource: string;
  asyncLoading: boolean;
}

export const DataSelect = ({ http, onSelect, urlDataSource, asyncLoading }: CustomView) => {
  const [selectedOptions, setSelectedOptions] = useState<EuiComboBoxOptionOption[]>([
    { label: 'OpenSearch' },
  ]);
  const [options, setOptions] = useState<any[]>([]);

  const datasources = () => {
    let dataOptions: EuiComboBoxOptionOption[] = [];
    let urlSourceFound = false;
    http
      .get(`/api/get_datasources`)
      .then((res) => {
        const data = res.data.resp;

        const connectorGroups = {};
        console.log(data)

        data.forEach((item) => {
          const connector = item.connector;
          const name = item.name;

          if (connector === 'S3GLUE' || connector === 'cloudwatchlog') {
            if (!connectorGroups[connector]) {
              connectorGroups[connector] = [];
            }

            connectorGroups[connector].push(name);
            if (name === urlDataSource) {
              urlSourceFound = true;
            }
          }
        });
        dataOptions.push({ label: 'OpenSearch' });

        for (const connector in connectorGroups) {
          if (connectorGroups.hasOwnProperty(connector)) {
            const connectorNames = connectorGroups[connector];

            dataOptions.push({
              label: connector,
              options: connectorNames.map((name) => ({ label: name })),
            });
          }
        }

        setOptions(dataOptions);
        if (urlSourceFound) {
          setSelectedOptions([{ label: urlDataSource }]);
          onSelect([{ label: urlDataSource }]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    datasources();
  }, []);

  const handleSelectionChange = (selectedItems: any[]) => {
    if (selectedItems.length > 0) {
      setSelectedOptions(selectedItems);
      onSelect(selectedItems);
    }
  };

  return (
    <EuiComboBox
      singleSelection={{ asPlainText: true }}
      isClearable={false}
      options={options}
      selectedOptions={selectedOptions}
      onChange={(selectedItems) => handleSelectionChange(selectedItems)}
      isDisabled={asyncLoading}
    />
  );
};
