/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const isTimePlural = (timeWindow: number) => {
  return timeWindow > 1 ? 's' : '';
};

export const validateIndexName = (value: string) => {
  const lowercaseUnderscoreHyphenRegex = /^[a-z_\-]+$/;

  if (!lowercaseUnderscoreHyphenRegex.test(value)) {
    return false;
  }

  // Check if the value does not begin with underscores or hyphens
  if (value.startsWith('_') || value.startsWith('-')) {
    return false;
  }

  // Check if the value does not contain disallowed characters
  const disallowedCharacters = /[\s,:"*+\/|?#><]/;
  if (disallowedCharacters.test(value)) {
    return false;
  }

  // If all checks pass, the value is valid
  return true;
};
