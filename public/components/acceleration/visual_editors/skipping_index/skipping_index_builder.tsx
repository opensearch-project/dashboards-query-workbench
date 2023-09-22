/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiBasicTable,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiButtonIcon,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import _ from 'lodash';
import { CreateAccelerationForm, SkippingIndexRowType } from '../../../../../common/types';
import { AddFieldsModal } from './add_fields_modal';
import { DeleteFieldsModal } from './delete_fields_modal';

interface SkippingIndexBuilderProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const SkippingIndexBuilder = ({
  accelerationFormData,
  setAccelerationFormData,
}: SkippingIndexBuilderProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const accelerationMethods = [
    { value: 'PARTITION', text: 'Partition' },
    { value: 'VALUE_SET', text: 'Value Set' },
    { value: 'MIN_MAX', text: 'Min Max' },
  ];

  let modal;

  if (isAddModalVisible)
    modal = (
      <AddFieldsModal
        setIsAddModalVisible={setIsAddModalVisible}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
    );

  if (isDeleteModalVisible)
    modal = (
      <DeleteFieldsModal
        setIsDeleteModalVisible={setIsDeleteModalVisible}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
    );

  const onTableChange = (page: { index: number; size: number }) => {
    setPageIndex(page.index);
    setPageSize(page.size);
  };

  const onChangeAccelerationMethod = (
    e: { target: { value: 'PARTITION' | 'VALUE_SET' | 'MIN_MAX' } },
    updateRow: SkippingIndexRowType
  ) => {
    setAccelerationFormData({
      ...accelerationFormData,
      skippingIndexQueryData: _.map(accelerationFormData.skippingIndexQueryData, (row) =>
        row.id === updateRow.id ? { ...row, accelerationMethod: e.target.value } : row
      ),
    });
  };

  const columns = [
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
      name: 'Acceleration method',
      render: (item: SkippingIndexRowType) => (
        <EuiSelect
          id="selectDocExample"
          options={accelerationMethods}
          value={item.accelerationMethod}
          onChange={(e) => onChangeAccelerationMethod(e, item)}
          aria-label="Use aria labels when no actual label is in use"
        />
      ),
    },
    {
      name: 'Delete',
      render: (item: SkippingIndexRowType) => {
        return (
          <EuiButtonIcon
            onClick={() => {
              setAccelerationFormData({
                ...accelerationFormData,
                skippingIndexQueryData: _.filter(
                  accelerationFormData.skippingIndexQueryData,
                  (o) => item.id !== o.id
                ),
              });
            }}
            iconType="trash"
            color="danger"
          />
        );
      },
    },
  ];

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [10, 20, 50],
  };

  useEffect(() => {
    if (accelerationFormData.dataTableFields.length > 0) {
      const tableRows: SkippingIndexRowType[] = [
        {
          ...accelerationFormData.dataTableFields[0],
          accelerationMethod: 'PARTITION',
        },
      ];
      setAccelerationFormData({ ...accelerationFormData, skippingIndexQueryData: tableRows });
    } else {
      setAccelerationFormData({ ...accelerationFormData, skippingIndexQueryData: [] });
    }
  }, [accelerationFormData.dataTableFields]);

  useEffect(() => {
    setTotalItemCount(accelerationFormData.skippingIndexQueryData.length);
  }, [accelerationFormData.skippingIndexQueryData]);

  return (
    <>
      <EuiText data-test-subj="skipping-index-builder">
        <h3>Skipping Index Builder</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiBasicTable
        itemID="id"
        items={accelerationFormData.skippingIndexQueryData.slice(
          pageSize * pageIndex,
          pageSize * (pageIndex + 1)
        )}
        columns={columns}
        pagination={pagination}
        onChange={({ page }) => onTableChange(page)}
        hasActions={true}
      />
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false} wrap>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={() => setIsAddModalVisible(true)}>
            Add fields
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => setIsDeleteModalVisible(true)} color="danger">
            Bulk delete
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      {modal}
    </>
  );
};
