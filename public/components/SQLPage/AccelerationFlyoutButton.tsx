/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton } from '@elastic/eui';
import React, { useEffect } from 'react';
import { catalogCacheRefs } from '../../../public/framework/catalog_cache_refs';
import { getRenderCreateAccelerationFlyout } from '../../../public/dependencies/register_observability_dependencies';

interface AccelerationFlyoutButtonProps {
  datasource: string;
  asyncLoading: boolean;
}

export const AccelerationFlyoutButton = (props: AccelerationFlyoutButtonProps) => {
  const { datasource, asyncLoading } = props;

  const renderCreateAccelerationFlyout = getRenderCreateAccelerationFlyout();
  const { loadStatus, startLoading, stopLoading } = catalogCacheRefs.useLoadTableColumnsToCache();

  useEffect(() => {
    return () => {
      stopLoading();
    };
  }, []);

  return (
    <EuiButton
      className="sql-accelerate-button"
      onClick={() =>
        renderCreateAccelerationFlyout(datasource, loadStatus, startLoading, stopLoading)
      }
      isDisabled={asyncLoading}
    >
      Accelerate Table
    </EuiButton>
  );
};
