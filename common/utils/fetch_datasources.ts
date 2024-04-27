/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import { CoreStart } from "../../../../src/core/public";

export const fetchDataSources = (http: CoreStart['http'], dataSourceMDSId: string, urlDataSource: string, onSuccess, onError) => {
    let dataOptions: { label: string; options?: Array<{ label: string }>; }[] = [];
    let urlSourceFound = false;
    if(!dataSourceMDSId){
        dataSourceMDSId = ''
    }

    http.get(`/api/get_datasources/${dataSourceMDSId}`)
      .then((res) => {
        const data = res.data.resp;
        const connectorGroups = {};

        data.forEach((item) => {
          const { connector, name } = item

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