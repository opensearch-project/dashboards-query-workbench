## Version 3.7.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.7.0

### Bug Fixes

* Migrate plugin to TypeScript 6.0.2 compatibility by removing conflicting dependencies and regenerating yarn.lock ([#549](https://github.com/opensearch-project/dashboards-query-workbench/pull/549))

### Infrastructure

* Add issues write permission to untriaged label workflow to fix 403 error when applying labels ([#557](https://github.com/opensearch-project/dashboards-query-workbench/pull/557))
* Pin GitHub Actions to commit SHAs to prevent supply chain attacks from mutable tag references ([#558](https://github.com/opensearch-project/dashboards-query-workbench/pull/558))

### Maintenance

* Apply lint auto-fixes across the codebase ([#552](https://github.com/opensearch-project/dashboards-query-workbench/pull/552))
* Apply additional lints with fixes and suppressions for remaining lint warnings ([#553](https://github.com/opensearch-project/dashboards-query-workbench/pull/553))
* Bump flatted version to address CVE-2026-32141 and CVE-2026-33228 ([#538](https://github.com/opensearch-project/dashboards-query-workbench/pull/538))
* Update uuid resolution version and fix babel configuration ([#551](https://github.com/opensearch-project/dashboards-query-workbench/pull/551))
