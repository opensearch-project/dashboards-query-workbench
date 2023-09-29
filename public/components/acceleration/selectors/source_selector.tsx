/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { CreateAccelerationForm } from '../../../../common/types';

interface AccelerationDataSourceSelectorProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const AccelerationDataSourceSelector = ({
  accelerationFormData,
  setAccelerationFormData,
}: AccelerationDataSourceSelectorProps) => {
  const [dataConnections, setDataConnections] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [selectedDataConnection, setSelectedDataConnection] = useState<
    EuiComboBoxOptionOption<string>[]
  >([]);
  const [databases, setDatabases] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [tables, setTables] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [selectedTable, setSelectedTable] = useState<EuiComboBoxOptionOption<string>[]>([]);

  useEffect(() => {
    // TODO: remove hardcoded responses
    setDataConnections([
      {
        label: 'spark1',
      },
      {
        label: 'spark2',
      },
    ]);
  }, []);

  useEffect(() => {
    // TODO: remove hardcoded responses
    if (accelerationFormData.dataSource !== '') {
      setDatabases([
        {
          label: 'Database1',
        },
        {
          label: 'Database2',
        },
      ]);
    }
  }, [accelerationFormData.dataSource]);

  useEffect(() => {
    // TODO: remove hardcoded responses
    if (accelerationFormData.database !== '') {
      setTables([
        {
          label: 'Table1',
        },
        {
          label: 'Table2',
        },
      ]);
    }
  }, [accelerationFormData.database]);

  useEffect(() => {
    // TODO: remove hardcoded responses
    if (accelerationFormData.dataTable !== '') {
      const idPrefix = htmlIdGenerator()();
      setAccelerationFormData({
        ...accelerationFormData,
        dataTableFields: [
          { id: `${idPrefix}1`, fieldName: 'Field1', dataType: 'Integer' },
          { id: `${idPrefix}2`, fieldName: 'Field2', dataType: 'Integer' },
          { id: `${idPrefix}3`, fieldName: 'Field3', dataType: 'Integer' },
          { id: `${idPrefix}4`, fieldName: 'Field4', dataType: 'Integer' },
          { id: `${idPrefix}5`, fieldName: 'Field5', dataType: 'Integer' },
          { id: `${idPrefix}6`, fieldName: 'Field6', dataType: 'Integer' },
          { id: `${idPrefix}7`, fieldName: 'Field7', dataType: 'Integer' },
          { id: `${idPrefix}8`, fieldName: 'Field8', dataType: 'Integer' },
          { id: `${idPrefix}9`, fieldName: 'Field9', dataType: 'Integer' },
          { id: `${idPrefix}10`, fieldName: 'Field10', dataType: 'Integer' },
          { id: `${idPrefix}11`, fieldName: 'Field11', dataType: 'Integer' },
          { id: `${idPrefix}12`, fieldName: 'Field12', dataType: 'TimestampType' },
        ],
      });
    }
  }, [accelerationFormData.dataTable]);

  return (
    <>
      <EuiText data-test-subj="datasource-selector-header">
        <h3>Select data source</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        Select data connection where the data you want to accelerate resides.
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Data source"
        helpText="A data source has to be configured and active to be able to select it and index data from."
      >
        <EuiComboBox
          placeholder="Select a data source"
          singleSelection={{ asPlainText: true }}
          options={dataConnections}
          selectedOptions={selectedDataConnection}
          onChange={(dataConnectionOptions) => {
            setAccelerationFormData({
              ...accelerationFormData,
              dataSource: dataConnectionOptions[0].label,
            });
            setSelectedDataConnection(dataConnectionOptions);
          }}
          isInvalid={selectedDataConnection.length === 0}
          isClearable={false}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Database"
        helpText="Select the database that contains the tables you'd like to use."
      >
        <EuiComboBox
          placeholder="Select a database"
          singleSelection={{ asPlainText: true }}
          options={databases}
          selectedOptions={selectedDatabase}
          onChange={(tableOptions) => {
            setAccelerationFormData({
              ...accelerationFormData,
              database: tableOptions[0].label,
            });
            setSelectedDatabase(tableOptions);
          }}
          isInvalid={selectedDatabase.length === 0}
          isClearable={false}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Table"
        helpText="Select the Spark table that has the data you would like to index."
      >
        <EuiComboBox
          placeholder="Select a table"
          singleSelection={{ asPlainText: true }}
          options={tables}
          selectedOptions={selectedTable}
          onChange={(tableOptions) => {
            setAccelerationFormData({
              ...accelerationFormData,
              dataTable: tableOptions[0].label,
            });
            setSelectedTable(tableOptions);
          }}
          isInvalid={selectedTable.length === 0}
          isClearable={false}
        />
      </EuiFormRow>
    </>
  );
};
