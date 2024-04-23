/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import { CoreStart } from "../../../../src/core/public";

export const fetchDataSources = (http: CoreStart['http'], dataSourceId: string, urlDataSource: string, onSuccess, onError) => {
    let dataOptions: { label: string; options?: any; }[] = [];
    let urlSourceFound = false;
    if(!dataSourceId){
        dataSourceId = ''
    }

    http.get(`/api/get_datasources/${dataSourceId}`)
      .then((res) => {
        const data = res.data.resp;
        const connectorGroups = {};

        data.forEach((item) => {
          const connector = item.connector;
          const name = item.name;

          if (connector === 'S3GLUE') {
            if (!connectorGroups[connector]) {
              connectorGroups[connector] = [];
            }

            connectorGroups[connector].push(name);
            if (name === urlDataSource) {
              urlSourceFound = true;
            }
          }
        });

        for (const connector in connectorGroups) {
          if (connectorGroups.hasOwnProperty(connector)) {
            const connectorNames = connectorGroups[connector];

            dataOptions.push({
              label: connector,
              options: connectorNames.map((name) => ({ label: name })),
            });
          }
        }

        onSuccess(dataOptions, urlSourceFound);
      })
      .catch((err) => {
        console.error(err);
        onError(err);
      });
  };