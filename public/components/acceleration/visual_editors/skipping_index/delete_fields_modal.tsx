/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiTableFieldDataColumnType,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiInMemoryTable,
  EuiModalFooter,
  EuiButton,
} from '@elastic/eui';
import _ from 'lodash';
import { CreateAccelerationForm, SkippingIndexRowType } from '../../../../../common/types';

interface AddFieldsModalProps {
  setIsDeleteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const DeleteFieldsModal = ({
  setIsDeleteModalVisible,
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
    {
      field: 'accelerationMethod',
      name: 'Acceleration method',
      sortable: true,
      truncateText: true,
    },
  ] as Array<EuiTableFieldDataColumnType<SkippingIndexRowType>>;

  const pagination = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  return (
    <EuiModal onClose={() => setIsDeleteModalVisible(false)}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>Bulk delete</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiInMemoryTable
          items={accelerationFormData.skippingIndexQueryData}
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
        <EuiButton onClick={() => setIsDeleteModalVisible(false)}>Cancel</EuiButton>
        <EuiButton
          onClick={() => {
            setAccelerationFormData({
              ...accelerationFormData,
              skippingIndexQueryData: _.differenceBy(
                accelerationFormData.skippingIndexQueryData,
                selectedFields,
                'id'
              ),
            });
            setIsDeleteModalVisible(false);
          }}
          color="danger"
          fill
        >
          Delete
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
