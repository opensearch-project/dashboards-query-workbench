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
import producer from 'immer';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { CreateAccelerationForm } from '../../../../common/types';
import { getJobId, pollQueryStatus } from '../../SQLPage/utils';
import { hasError, validateDataSource } from '../create/utils';

interface AccelerationDataSourceSelectorProps {
  http: CoreStart['http'];
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const AccelerationDataSourceSelector = ({
  http,
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
  const [loadingComboBoxes, setLoadingComboBoxes] = useState({
    dataSource: false,
    database: false,
    dataTable: false,
  });

  const loadDataSource = () => {
    setLoadingComboBoxes({ ...loadingComboBoxes, dataSource: true });
    http
      .get(`/api/get_datasources`)
      .then((res) => {
        const data = res.data.resp;
        setDataConnections(
          data
            .filter((connection: any) => connection.connector.toUpperCase() === 'S3GLUE')
            .map((connection: any) => ({ label: connection.name }))
        );
      })
      .catch((err) => {
        console.error(err);
      });
    setLoadingComboBoxes({ ...loadingComboBoxes, dataSource: false });
  };

  const loadDatabases = () => {
    setLoadingComboBoxes({ ...loadingComboBoxes, database: true });
    const query = {
      lang: 'sql',
      query: `SHOW SCHEMAS IN ${accelerationFormData.dataSource}`,
      datasource: accelerationFormData.dataSource,
    };
    getJobId(query, http, (id) => {
      pollQueryStatus(id, http, (data) => {
        console.log('data', data);
        setLoadingComboBoxes({ ...loadingComboBoxes, database: false });
      });
    });
  };

  useEffect(() => {
    loadDataSource();
  }, []);

  useEffect(() => {
    // TODO: remove hardcoded responses
    if (accelerationFormData.dataSource !== '') {
      loadDatabases();
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
        isInvalid={hasError(accelerationFormData.formErrors, 'dataSourceError')}
        error={accelerationFormData.formErrors.dataSourceError}
      >
        <EuiComboBox
          placeholder="Select a data source"
          singleSelection={{ asPlainText: true }}
          options={dataConnections}
          selectedOptions={selectedDataConnection}
          onChange={(dataConnectionOptions) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.dataSource = dataConnectionOptions[0].label;
                accData.formErrors.dataSourceError = validateDataSource(
                  dataConnectionOptions[0].label
                );
              })
            );
            setSelectedDataConnection(dataConnectionOptions);
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'dataSourceError')}
          isLoading={loadingComboBoxes.dataSource}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Database"
        helpText="Select the database that contains the tables you'd like to use."
        isInvalid={hasError(accelerationFormData.formErrors, 'databaseError')}
        error={accelerationFormData.formErrors.databaseError}
      >
        <EuiComboBox
          placeholder="Select a database"
          singleSelection={{ asPlainText: true }}
          options={databases}
          selectedOptions={selectedDatabase}
          onChange={(databaseOptions) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.database = databaseOptions[0].label;
                accData.formErrors.databaseError = validateDataSource(databaseOptions[0].label);
              })
            );
            setSelectedDatabase(databaseOptions);
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'databaseError')}
          isLoading={loadingComboBoxes.database}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Table"
        helpText="Select the Spark table that has the data you would like to index."
        isInvalid={hasError(accelerationFormData.formErrors, 'dataTableError')}
        error={accelerationFormData.formErrors.dataTableError}
      >
        <EuiComboBox
          placeholder="Select a table"
          singleSelection={{ asPlainText: true }}
          options={tables}
          selectedOptions={selectedTable}
          onChange={(tableOptions) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.dataTable = tableOptions[0].label;
                accData.formErrors.dataTableError = validateDataSource(tableOptions[0].label);
              })
            );
            setSelectedTable(tableOptions);
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'dataTableError')}
          isLoading={loadingComboBoxes.dataTable}
        />
      </EuiFormRow>
    </>
  );
};
