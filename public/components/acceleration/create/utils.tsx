/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ACCELERATION_INDEX_NAME_REGEX } from '../../../../common/constants';

export const pluralizeTime = (timeWindow: number) => {
  return timeWindow > 1 ? 's' : '';
};

export const validateIndexName = (value: string) => {
  // Check if the value does not begin with underscores or hyphens and all characters are lower case
  return ACCELERATION_INDEX_NAME_REGEX.test(value);
};
