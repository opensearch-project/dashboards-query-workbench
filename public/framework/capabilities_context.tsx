/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, ReactNode, useContext } from 'react';
import {
  DEFAULT_CAPABILITIES,
  DeploymentCapabilities,
} from '../../common/utils/deployment_capabilities';

export const CapabilitiesContext = createContext<DeploymentCapabilities>(DEFAULT_CAPABILITIES);

export const CapabilitiesProvider: React.FC<{
  value: DeploymentCapabilities;
  children: ReactNode;
}> = ({ value, children }) => (
  <CapabilitiesContext.Provider value={value}>{children}</CapabilitiesContext.Provider>
);

export const useCapabilities = (): DeploymentCapabilities => useContext(CapabilitiesContext);
