/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiComboBoxOptionOption, EuiContextMenu, EuiPopover } from '@elastic/eui';
import React, { useState } from 'react';
import {
  COVERING_INDEX_QUERY,
  CREATE_DATABASE_QUERY,
  CREATE_TABLE_QUERY,
  SKIPPING_INDEX_QUERY,
} from '../../../common/constants';

interface CreateButtonProps {
  updateSQLQueries: (query: string) => void;
  selectedDatasource: EuiComboBoxOptionOption[];
}

export const CreateButton = ({ updateSQLQueries, selectedDatasource }: CreateButtonProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const togglePopover = (option) => {
    setSelectedOption(option);
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleSubMenuClick = (query: string) => {
    updateSQLQueries(query);
    closePopover();
  };

  const fromSqlItems = [
    {
      name: 'Create Database',
      onClick: () => handleSubMenuClick(CREATE_DATABASE_QUERY),
    },
    {
      name: 'Create Table',
      onClick: () => handleSubMenuClick(CREATE_TABLE_QUERY),
    },
  ];

  const acceleratedIndexItems = [
    {
      name: 'Skipping Index',
      onClick: () => handleSubMenuClick(SKIPPING_INDEX_QUERY),
    },
    {
      name: 'Covering Index',
      onClick: () => handleSubMenuClick(COVERING_INDEX_QUERY),
    },
  ];

  const button = (
    <EuiButton iconType="arrowDown" iconSide="right" onClick={() => togglePopover(null)}>
      Create
    </EuiButton>
  );

  return (
    <>
      {selectedDatasource && selectedDatasource[0].label !== 'OpenSearch' && (
        <EuiPopover
          button={button}
          isOpen={isPopoverOpen}
          closePopover={closePopover}
          panelPaddingSize="s"
          anchorPosition="downLeft"
        >
          <EuiContextMenu
            initialPanelId={0}
            panels={[
              {
                id: 0,
                title: 'Create options',
                items: [
                  {
                    name: 'Spark SQL',
                    panel: 1,
                  },
                  {
                    name: 'Acceleration Index',
                    panel: 2,
                  },
                ],
              },
              {
                id: 1,
                title: 'SPARK SQL Options',
                items: fromSqlItems,
              },
              {
                id: 2,
                title: 'Acceleration Index Options',
                items: acceleratedIndexItems,
              },
            ]}
          />
        </EuiPopover>
      )}
    </>
  );
};
