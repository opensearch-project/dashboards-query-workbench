## Version 2.12.0.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards 2.12.0

### Features

Add materlized views, manual refresh option https://github.com/opensearch-project/dashboards-query-workbench/pull/159
Added changes for making tree view persistent https://github.com/opensearch-project/dashboards-query-workbench/pull/153
Support dark mode and session for sql https://github.com/opensearch-project/dashboards-query-workbench/pull/165
Update ppl editor readonly property https://github.com/opensearch-project/dashboards-query-workbench/pull/248
Support for multiple datasource sessions https://github.com/opensearch-project/dashboards-query-workbench/pull/251

### Bug Fixes

fixed create table async query bug https://github.com/opensearch-project/dashboards-query-workbench/pull/158
design changes for loading, changed the banner: https://github.com/opensearch-project/dashboards-query-workbench/pull/170
Make checkpoint mandatory, add watermark delay, minor UI fixes https://github.com/opensearch-project/dashboards-query-workbench/pull/173
UI fixes for loading state, empty tree, added toast for error, fixed no indicies error https://github.com/opensearch-project/dashboards-query-workbench/pull/176
Session update, minor fixes for acceleration flyout https://github.com/opensearch-project/dashboards-query-workbench/pull/179
Add backticks and remove ckpt for manual refresh in acceleration flyout https://github.com/opensearch-project/dashboards-query-workbench/pull/183
UI-bug fixes, added create query for MV https://github.com/opensearch-project/dashboards-query-workbench/pull/182
added fix for loading spinner issue for other database https://github.com/opensearch-project/dashboards-query-workbench/pull/189
Fix error handling for user w/o proper permissions https://github.com/opensearch-project/dashboards-query-workbench/pull/195
Add minutes option to acceleration https://github.com/opensearch-project/dashboards-query-workbench/pull/249
added changes for cancel query not being able to cancel https://github.com/opensearch-project/dashboards-query-workbench/pull/256

### Infrastructure

Fix jest tests https://github.com/opensearch-project/dashboards-query-workbench/pull/255

### Maintenance

Increment version to 2.12.0.0 https://github.com/opensearch-project/dashboards-query-workbench/pull/164
Onboard Jenkins prod docker images to github actions https://github.com/opensearch-project/dashboards-query-workbench/pull/198
Bump Cypress to version 12 https://github.com/opensearch-project/dashboards-query-workbench/pull/234
Add E2E Cypress workflow for sql workbench https://github.com/opensearch-project/dashboards-query-workbench/pull/235
Add FTR workflow for sql workbench https://github.com/opensearch-project/dashboards-query-workbench/pull/239
Add eslint workflow https://github.com/opensearch-project/dashboards-query-workbench/pull/245
babel config change: https://github.com/opensearch-project/dashboards-query-workbench/pull/229

