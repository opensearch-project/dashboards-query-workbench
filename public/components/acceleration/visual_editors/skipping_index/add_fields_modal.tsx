/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
} from '@elastic/eui';
import React, { useState } from 'react';
import { CreateAccelerationForm, DataTableFieldsType } from '../../../../../common/types';
import _ from 'lodash';

interface AddFieldsModalProps {
  setIsAddModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const AddFieldsModal = ({
  setIsAddModalVisible,
  accelerationFormData,
  setAccelerationFormData,
}: AddFieldsModalProps) => {
  const [selectedFields, setSelectedFields] = useState([]);

  const tableColumns = [
    {
      field: 'fieldName',
      name: 'Field name',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'dataType',
      name: 'Datatype',
      sortable: true,
      truncateText: true,
    },
  ] as Array<EuiTableFieldDataColumnType<DataTableFieldsType>>;

  const pagination = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  return (
    <EuiModal onClose={() => setIsAddModalVisible(false)}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>Add fields</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiInMemoryTable
          items={_.differenceBy(
            accelerationFormData.dataTableFields,
            accelerationFormData.skippingIndexQueryData,
            'id'
          )}
          itemId="id"
          columns={tableColumns}
          search={true}
          pagination={pagination}
          sorting={true}
          isSelectable={true}
          selection={{
            onSelectionChange: (items) => setSelectedFields(items),
          }}
        />
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton onClick={() => setIsAddModalVisible(false)}>Cancel</EuiButton>
        <EuiButton
          onClick={() => {
            setAccelerationFormData({
              ...accelerationFormData,
              skippingIndexQueryData: [
                ...accelerationFormData.skippingIndexQueryData,
                ...selectedFields.map((x) => {
                  return { ...x, accelerationMethod: 'PARTITION' };
                }),
              ],
            });
            setIsAddModalVisible(false);
          }}
          fill
        >
          Add
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
