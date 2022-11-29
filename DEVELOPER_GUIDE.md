## Developer Guide

So you want to contribute code to this project? Excellent! We're glad you're here. Here's what you need to do.

### Setup

1. Download OpenSearch for the version that matches the [OpenSearch Dashboards version specified in package.json](package.json)
   1. See [OpenSearch Github](https://github.com/opensearch-project/OpenSearch)
2. Download and install the most recent version of [OpenSearch dashboards-query-workbench plugin](https://github.com/opensearch-project/dashboards-query-workbench).
3. Download the OpenSearch Dashboards source code for the [version specified in package.json](package.json) you want to set up.
   1. See [OpenSearch Dashboards Github](https://github.com/opensearch-project/OpenSearch-Dashboards) 

See the [OpenSearch Dashboards contributing guide](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/CONTRIBUTING.md) to get started.
   
4. Change your node version to the version specified in `.node-version` inside the OpenSearch Dashboards root directory.
5. cd into the OpenSearch Dashboards source code directory.
6. Check out this package from version control into the `plugins` directory.
```
git clone git@github.com:opensearch-project/dashboards-query-workbench.git plugins --no-checkout
cd plugins
echo '*' >> .git/info/sparse-checkout
git config core.sparseCheckout true
git checkout main
```
7. Run `yarn osd bootstrap` inside `OpenSearch-Dashboards/plugins/dashboards-query-workbench`.

Ultimately, your directory structure should look like this:

```md
.
├── OpenSearch-Dashboards
│   └── plugins
│       └── dashboards-query-workbench
```


## Build

To build the plugin's distributable zip simply run `yarn build`.

Example output: `./build/query-workbench-dashboards*.zip`


## Run

- `yarn start`

  Starts OpenSearch Dashboards and includes this plugin. OpenSearch Dashboards will be available on `localhost:5601`.

- `NODE_PATH=../../node_modules yarn test:jest`

  Runs the plugin tests.


### Submitting Changes

See [CONTRIBUTING](CONTRIBUTING.md).