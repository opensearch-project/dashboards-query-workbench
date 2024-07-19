/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const convertLegacyWorkbenchUrl = (location: Location) => {
  // Update pathname to new structure
  let pathname = location.pathname.replace(
    'app/opensearch-query-workbench',
    'app/dev_tools#/opensearch-query-workbench'
  );

  // If the pathname ends with '/', remove it before appending the hash
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Adjust the hash part of the URL
  let hash = location.hash.replace('#/', '/');

  // If hash contains "accelerate" or any random text, handle it properly
  if (hash.includes('accelerate/')) {
    hash = hash.replace('#/', '/');
  } else if (hash.startsWith('#/')) {
    hash = hash.replace('#/', '/');
  }

  const finalUrl = `${pathname}${hash}`;

  return finalUrl;
};
