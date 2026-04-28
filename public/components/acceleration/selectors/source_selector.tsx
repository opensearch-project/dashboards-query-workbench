/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBoxOptionOption,
  EuiCompressedComboBox,
  EuiCompressedFormRow,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import producer from 'immer';
import React, { useCallback, useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import {
  AsyncApiResponse,
  AsyncQueryStatus,
  CreateAccelerationForm,
} from '../../../../common/types';
import { executeAsyncQuery } from '../../../../common/utils/async_query_helpers';
import { useToast } from '../../../../common/utils/toast_helper';
import { hasError, validateDataSource } from '../create/utils';

interface AccelerationDataSourceSelectorProps {
  http: CoreStart['http'];
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
  selectedDatasource: EuiComboBoxOptionOption[];
}

export const AccelerationDataSourceSelector = ({
  http,
  accelerationFormData,
  setAccelerationFormData,
  selectedDatasource,
}: AccelerationDataSourceSelectorProps) => {
  const { setToast } = useToast();
  const [dataConnections, setDataConnections] = useState<Array<EuiComboBoxOptionOption<string>>>(
    []
  );
  const [selectedDataConnection, setSelectedDataConnection] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >(selectedDatasource.length > 0 ? [{ label: selectedDatasource[0].label }] : []);
  const [databases, setDatabases] = useState<Array<EuiComboBoxOptionOption<string>>>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<Array<EuiComboBoxOptionOption<string>>>(
    []
  );
  const [tables, setTables] = useState<Array<EuiComboBoxOptionOption<string>>>([]);
  const [selectedTable, setSelectedTable] = useState<Array<EuiComboBoxOptionOption<string>>>([]);
  const [loadingComboBoxes, setLoadingComboBoxes] = useState({
    dataSource: false,
    database: false,
    dataTable: false,
  });

  const loadDataSource = useCallback(() => {
    setLoadingComboBoxes((prev) => ({ ...prev, dataSource: true }));
    http
      .get(`/api/get_datasources`)
      .then((res) => {
        const data = res.data.resp;
        setDataConnections(
          data
            .filter(
              (connection: { connector: string; name: string }) =>
                connection.connector.toUpperCase() === 'S3GLUE'
            )
            .map((connection: { connector: string; name: string }) => ({ label: connection.name }))
        );
      })
      .catch((err) => {
        console.error(err);
        setToast(`ERROR: failed to load datasources`, 'danger');
      });
    setLoadingComboBoxes((prev) => ({ ...prev, dataSource: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setToast is unstable (new ref every render) and would cause infinite loops
  }, [http]);

  const loadDatabases = useCallback(() => {
    setLoadingComboBoxes((prev) => ({ ...prev, database: true }));
    const query = {
      lang: 'sql',
      query: `SHOW SCHEMAS IN \`${accelerationFormData.dataSource}\``,
      datasource: accelerationFormData.dataSource,
    };

    executeAsyncQuery(
      accelerationFormData.dataSource,
      query,
      (response: AsyncApiResponse) => {
        const status = response.data.resp.status.toLowerCase();
        if (status === AsyncQueryStatus.Success) {
          let databaseOptions: Array<EuiComboBoxOptionOption<string>> = [];
          if (response.data.resp.datarows.length > 0)
            databaseOptions = response.data.resp.datarows.map((subArray: string[]) => ({
              label: subArray[0],
            }));
          setDatabases(databaseOptions);
          setLoadingComboBoxes((prev) => ({ ...prev, database: false }));
        }
        if (status === AsyncQueryStatus.Failed || status === AsyncQueryStatus.Cancelled) {
          setLoadingComboBoxes((prev) => ({ ...prev, database: false }));
        }
      },
      () => setLoadingComboBoxes((prev) => ({ ...prev, database: false }))
    );
  }, [accelerationFormData.dataSource]);

  const loadTables = useCallback(() => {
    setLoadingComboBoxes((prev) => ({ ...prev, dataTable: true }));
    const query = {
      lang: 'sql',
      query: `SHOW TABLES IN \`${accelerationFormData.dataSource}\`.\`${accelerationFormData.database}\``,
      datasource: accelerationFormData.dataSource,
    };

    executeAsyncQuery(
      accelerationFormData.dataSource,
      query,
      (response: AsyncApiResponse) => {
        const status = response.data.resp.status.toLowerCase();
        if (status === AsyncQueryStatus.Success) {
          let dataTableOptions: Array<EuiComboBoxOptionOption<string>> = [];
          if (response.data.resp.datarows.length > 0)
            dataTableOptions = response.data.resp.datarows.map((subArray) => ({
              label: subArray[1],
            }));
          setTables(dataTableOptions);
          setLoadingComboBoxes((prev) => ({ ...prev, dataTable: false }));
        }
        if (status === AsyncQueryStatus.Failed || status === AsyncQueryStatus.Cancelled) {
          setLoadingComboBoxes((prev) => ({ ...prev, dataTable: false }));
        }
      },
      () => setLoadingComboBoxes((prev) => ({ ...prev, dataTable: false }))
    );
  }, [accelerationFormData.dataSource, accelerationFormData.database]);

  useEffect(() => {
    loadDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadDataSource is unstable; should only run on mount
  }, []);

  useEffect(() => {
    if (accelerationFormData.dataSource !== '') {
      loadDatabases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadDatabases is unstable; only re-run when dataSource changes
  }, [accelerationFormData.dataSource]);

  useEffect(() => {
    if (accelerationFormData.database !== '') {
      loadTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadTables is unstable; only re-run when database changes
  }, [accelerationFormData.database]);

  return (
    <>
      <EuiText data-test-subj="datasource-selector-header">
        <h3>Select data source</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        Select the data source to accelerate data from. External data sources may take time to load.
      </EuiText>
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label="Data source"
        helpText="A data source has to be configured and active to be able to select it and index data from."
        isInvalid={hasError(accelerationFormData.formErrors, 'dataSourceError')}
        error={accelerationFormData.formErrors.dataSourceError}
      >
        <EuiCompressedComboBox
          placeholder="Select a data source"
          singleSelection={{ asPlainText: true }}
          options={dataConnections}
          selectedOptions={selectedDataConnection}
          onChange={(dataConnectionOptions) => {
            if (dataConnectionOptions.length > 0) {
              setAccelerationFormData(
                producer((accData) => {
                  accData.dataSource = dataConnectionOptions[0].label;
                  accData.formErrors.dataSourceError = validateDataSource(
                    dataConnectionOptions[0].label
                  );
                })
              );
              setSelectedDataConnection(dataConnectionOptions);
            }
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'dataSourceError')}
          isLoading={loadingComboBoxes.dataSource}
        />
      </EuiCompressedFormRow>
      <EuiCompressedFormRow
        label="Database"
        helpText="Select the database that contains the tables you'd like to use."
        isInvalid={hasError(accelerationFormData.formErrors, 'databaseError')}
        error={accelerationFormData.formErrors.databaseError}
      >
        <EuiCompressedComboBox
          placeholder="Select a database"
          singleSelection={{ asPlainText: true }}
          options={databases}
          selectedOptions={selectedDatabase}
          onChange={(databaseOptions) => {
            if (databaseOptions.length > 0) {
              setAccelerationFormData(
                producer((accData) => {
                  accData.database = databaseOptions[0].label;
                  accData.formErrors.databaseError = validateDataSource(databaseOptions[0].label);
                })
              );
              setSelectedDatabase(databaseOptions);
            }
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'databaseError')}
          isLoading={loadingComboBoxes.database}
        />
      </EuiCompressedFormRow>
      <EuiCompressedFormRow
        label="Table"
        helpText="Select the Spark table that has the data you would like to index."
        isInvalid={hasError(accelerationFormData.formErrors, 'dataTableError')}
        error={accelerationFormData.formErrors.dataTableError}
      >
        <EuiCompressedComboBox
          placeholder="Select a table"
          singleSelection={{ asPlainText: true }}
          options={tables}
          selectedOptions={selectedTable}
          onChange={(tableOptions) => {
            if (tableOptions.length > 0) {
              setAccelerationFormData(
                producer((accData) => {
                  accData.dataTable = tableOptions[0].label;
                  accData.formErrors.dataTableError = validateDataSource(tableOptions[0].label);
                })
              );
              setSelectedTable(tableOptions);
            }
          }}
          isClearable={false}
          isInvalid={hasError(accelerationFormData.formErrors, 'dataTableError')}
          isLoading={loadingComboBoxes.dataTable}
        />
      </EuiCompressedFormRow>
    </>
  );
};
