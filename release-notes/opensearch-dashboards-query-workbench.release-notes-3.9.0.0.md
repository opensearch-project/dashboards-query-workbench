## Version 3.9.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.9.0

### Features

* Support single-version OSD Query Workbench against Elasticsearch and OpenDistro backends ([#600](https://github.com/opensearch-project/dashboards-query-workbench/pull/600))

### Enhancements

* Add single-version OSD capability gating for query workbench to support OpenSearch backends from 1.3.2 through 3.x ([#586](https://github.com/opensearch-project/dashboards-query-workbench/pull/586))

### Bug Fixes

* Fix TS5011 compilation error in Cypress E2E tests by setting rootDir explicitly ([#579](https://github.com/opensearch-project/dashboards-query-workbench/pull/579))

### Infrastructure

* Replace third-party GitHub Actions with SHA-pinned equivalents to unblock CI ([#580](https://github.com/opensearch-project/dashboards-query-workbench/pull/580))
* Fix code-coverage GitHub Action configuration ([#598](https://github.com/opensearch-project/dashboards-query-workbench/pull/598))
* Install the FTR repo's lockfile-pinned Cypress instead of the latest release to fix Cypress 16 incompatibility ([#601](https://github.com/opensearch-project/dashboards-query-workbench/pull/601))

### Maintenance

* Bump qs to 6.16.0 to address CVE-2026-82562 and CVE-2026-82417 ([#594](https://github.com/opensearch-project/dashboards-query-workbench/pull/594))
* Clean up resolutions and dependencies, align with OpenSearch Dashboards 3.8, and address CVEs ([#585](https://github.com/opensearch-project/dashboards-query-workbench/pull/585))
