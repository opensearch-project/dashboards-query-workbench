/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageSideBar,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { IHttpResponse } from 'angular';
import _ from 'lodash';
import React from 'react';
import { ChromeBreadcrumb, CoreStart } from '../../../../../src/core/public';
import {
  ASYNC_QUERY_ENDPOINT,
  ASYNC_QUERY_JOB_ENDPOINT,
  OPENSEARCH_SQL_INIT_QUERY,
  POLL_INTERVAL_MS,
} from '../../../common/constants';
import { AsyncQueryLoadingStatus } from '../../../common/types';
import { getAsyncSessionId, setAsyncSessionId } from '../../../common/utils/async_query_helpers';
import { MESSAGE_TAB_LABEL } from '../../utils/constants';
import {
  Tree,
  getDefaultTabId,
  getDefaultTabLabel,
  getQueries,
  getSelectedResults,
} from '../../utils/utils';
import { PPLPage } from '../PPLPage/PPLPage';
import Switch from '../QueryLanguageSwitch/Switch';
import QueryResults from '../QueryResults/QueryResults';
import { CreateButton } from '../SQLPage/CreateButton';
import { DataSelect } from '../SQLPage/DataSelect';
import { SQLPage } from '../SQLPage/SQLPage';
import { TableView } from '../SQLPage/table_view';

interface ResponseData {
  ok: boolean;
  resp: any;
  body: any;
}

export interface ResponseDetail<T> {
  fulfilled: boolean;
  errorMessage?: string;
  data?: T;
}

export interface TranslateResult {
  [key: string]: any;
}

export interface QueryMessage {
  text: any;
  className: string;
}

export interface QueryResult {
  fields: string[];
  records: DataRow[];
  message: string;
}

export interface Tab {
  id: string;
  name: string;
  disabled: boolean;
}

export interface ItemIdToExpandedRowMap {
  [key: string]: {
    nodes: Tree;
    expandedRow?: {};
    selectedNodes?: { [key: string]: any };
  };
}

export interface DataRow {
  rowId: number;
  data: { [key: string]: any };
}

interface MainProps {
  httpClient: CoreStart['http'];
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
  isAccelerationFlyoutOpen: boolean;
  urlDataSource: string;
}

interface MainState {
  language: string;
  sqlQueriesString: string;
  pplQueriesString: string;
  queries: string[];
  queryTranslations: Array<ResponseDetail<TranslateResult>>;
  queryResultsTable: Array<ResponseDetail<QueryResult>>;
  queryResults: Array<ResponseDetail<string>>;
  queryResultsJSON: Array<ResponseDetail<string>>;
  queryResultsCSV: Array<ResponseDetail<string>>;
  queryResultsTEXT: Array<ResponseDetail<string>>;
  selectedTabName: string;
  selectedTabId: string;
  searchQuery: string;
  itemIdToExpandedRowMap: ItemIdToExpandedRowMap;
  messages: QueryMessage[];
  isResultFullScreen: boolean;
  selectedDatasource: EuiComboBoxOptionOption[];
  asyncLoading: boolean;
  asyncLoadingStatus: AsyncQueryLoadingStatus;
  asyncQueryError: string;
  asyncJobId: string;
  refreshTree: boolean;
  isAccelerationFlyoutOpened: boolean;
  isCallOutVisible: boolean;
}

const SUCCESS_MESSAGE = 'Success';

const errorQueryResponse = (queryResultResponseDetail: any) => {
  const errorMessage =
    queryResultResponseDetail.errorMessage +
    ', this query is not runnable. \n \n' +
    queryResultResponseDetail.data;
  return errorMessage;
};

export function getQueryResultsForTable(
  queryResults: Array<ResponseDetail<string>>,
  jsonParseData: boolean
): Array<ResponseDetail<QueryResult>> {
  return queryResults.map(
    (queryResultResponseDetail: ResponseDetail<string>): ResponseDetail<QueryResult> => {
      if (!queryResultResponseDetail.fulfilled) {
        return {
          fulfilled: queryResultResponseDetail.fulfilled,
          errorMessage: errorQueryResponse(queryResultResponseDetail),
        };
      } else {
        const resultData = jsonParseData
          ? JSON.parse(queryResultResponseDetail.data)
          : queryResultResponseDetail.data;
        const responseObj = queryResultResponseDetail.data ? resultData : '';
        const fields: string[] = [];
        const dataRows: DataRow[] = [];

        const schema: object[] = _.get(responseObj, 'schema');
        const datarows: any[][] = _.get(responseObj, 'datarows');
        let queryType = 'default';

        for (const column of schema.values()) {
          if (_.isEqual(_.get(column, 'name'), 'TABLE_NAME')) {
            queryType = 'show';
            for (const col of schema.values()) {
              if (_.isEqual(_.get(col, 'name'), 'DATA_TYPE')) queryType = 'describe';
            }
          }
        }

        switch (queryType) {
          case 'show':
            fields[0] = 'TABLE_NAME';

            let index: number = -1;
            for (const [id, field] of schema.entries()) {
              if (_.eq(_.get(field, 'name'), 'TABLE_NAME')) {
                index = id;
                break;
              }
            }

            for (const [id, field] of datarows.entries()) {
              const row: { [key: string]: any } = {};
              row.TABLE_NAME = field[index];
              const dataRow: DataRow = {
                rowId: id,
                data: row,
              };
              dataRows[id] = dataRow;
            }
            break;

          case 'describe':
          case 'default':
            for (const [id, field] of schema.entries()) {
              let alias: any = null;
              try {
                alias = _.get(field, 'alias');
              } catch (e) {
                console.log('No alias for field ' + field);
              } finally {
                fields[id] = !alias ? _.get(field, 'name') : alias;
              }
            }

            for (const [id, data] of datarows.entries()) {
              const row: { [key: string]: any } = {};
              for (const idx of schema.keys()) {
                const fieldname = fields[idx];
                row[fieldname] = _.isNull(data[idx]) ? '-' : data[idx];
              }
              const dataRow: DataRow = {
                rowId: id,
                data: row,
              };
              dataRows[id] = dataRow;
            }
            break;

          default:
        }
        return {
          fulfilled: queryResultResponseDetail.fulfilled,
          data: {
            fields,
            records: dataRows,
            message: SUCCESS_MESSAGE,
          },
        };
      }
    }
  );
}

export class Main extends React.Component<MainProps, MainState> {
  httpClient: CoreStart['http'];

  constructor(props: MainProps) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.state = {
      language: 'SQL',
      sqlQueriesString: OPENSEARCH_SQL_INIT_QUERY,
      pplQueriesString: '',
      queries: [],
      queryTranslations: [],
      queryResultsTable: [],
      queryResults: [],
      queryResultsJSON: [],
      queryResultsCSV: [],
      queryResultsTEXT: [],
      selectedTabName: MESSAGE_TAB_LABEL,
      selectedTabId: MESSAGE_TAB_LABEL,
      searchQuery: '',
      itemIdToExpandedRowMap: {},
      messages: [],
      isResultFullScreen: false,
      selectedDatasource: [{ label: 'OpenSearch' }],
      asyncLoading: false,
      asyncLoadingStatus: AsyncQueryLoadingStatus.Success,
      asyncQueryError: '',
      asyncJobId: '',
      refreshTree: false,
      isAccelerationFlyoutOpened: false,
      isCallOutVisible: false,
    };
    this.httpClient = this.props.httpClient;
    this.updateSQLQueries = _.debounce(this.updateSQLQueries, 250).bind(this);
    this.updatePPLQueries = _.debounce(this.updatePPLQueries, 250).bind(this);
    this.setIsResultFullScreen = this.setIsResultFullScreen.bind(this);
  }

  componentDidMount() {
    this.props.setBreadcrumbs([
      {
        text: 'Query Workbench',
        href: '#',
      },
    ]);
  }

  processTranslateResponse(response: IHttpResponse<ResponseData>): ResponseDetail<TranslateResult> {
    if (!response) {
      return {
        fulfilled: false,
        errorMessage: 'no response',
        data: undefined,
      };
    }
    if (!response.data.ok) {
      return {
        fulfilled: false,
        errorMessage: response.data.resp,
        data: undefined,
      };
    }
    return {
      fulfilled: true,
      data: response.data.resp,
    };
  }

  processQueryResponse(response: IHttpResponse<ResponseData>): ResponseDetail<string> {
    if (!response) {
      return {
        fulfilled: false,
        errorMessage: 'no response',
        data: '',
      };
    }
    if (!response.data.ok) {
      const err = response.data.resp;
      console.log('Error occurred when processing query response: ', err);

      // Exclude a special case from the error cases:
      // When downloading the csv result, it gets the "Unable to parse/serialize body" response
      // But data is also returned in data body. For this case:
      // Mark fulfilled to true for this case to write the csv result to downloading file
      if (response.data.body && err === 'Unable to parse/serialize body') {
        return {
          fulfilled: true,
          errorMessage: err,
          data: response.data.body,
        };
      }
      return {
        fulfilled: false,
        errorMessage: err,
        data: '',
      };
    }

    return {
      fulfilled: true,
      data: response.data.resp,
    };
  }

  onSelectedTabIdChange = (tab: Tab): void => {
    this.setState({
      selectedTabId: tab.id,
      selectedTabName: tab.name,
      searchQuery: '',
      itemIdToExpandedRowMap: {},
    });
  };

  onQueryChange = ({ query }: { query: any }) => {
    // Reset pagination state.
    this.setState({
      searchQuery: query,
      itemIdToExpandedRowMap: {},
    });
  };

  updateExpandedMap = (map: ItemIdToExpandedRowMap): void => {
    this.setState({ itemIdToExpandedRowMap: map });
  };

  // It returns the error or successful message to display in the Message Tab
  getMessage(queryResultsForTable: Array<ResponseDetail<QueryResult>>): QueryMessage[] {
    return queryResultsForTable.map((queryResult) => {
      return {
        text:
          queryResult.fulfilled && queryResult.data
            ? queryResult.data.message
            : queryResult.errorMessage,
        className: queryResult.fulfilled ? 'successful-message' : 'error-message',
      };
    });
  }

  getTranslateMessage(translationResult: Array<ResponseDetail<TranslateResult>>): QueryMessage[] {
    return translationResult.map((translation) => {
      return {
        text: translation.data ? SUCCESS_MESSAGE : translation.errorMessage,
        className: translation.fulfilled ? 'successful-message' : 'error-message',
      };
    });
  }

  onRun = (queriesString: string): void => {
    const queries: string[] = getQueries(queriesString);
    const language = this.state.language;
    if (queries.length > 0) {
      const endpoint = '/api/sql_console/' + (_.isEqual(language, 'SQL') ? 'sqlquery' : 'pplquery');
      const responsePromise = Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(endpoint, { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      );
      Promise.all([responsePromise]).then(([response]) => {
        const results: Array<ResponseDetail<string>> = response.map((resp) =>
          this.processQueryResponse(resp as IHttpResponse<ResponseData>)
        );
        const resultTable: Array<ResponseDetail<QueryResult>> = getQueryResultsForTable(
          results,
          true
        );
        this.setState(
          {
            queries,
            queryResults: results,
            queryResultsTable: resultTable,
            selectedTabId: getDefaultTabId(results),
            selectedTabName: getDefaultTabLabel(results, queries[0]),
            messages: this.getMessage(resultTable),
            itemIdToExpandedRowMap: {},
            queryResultsJSON: [],
            queryResultsCSV: [],
            queryResultsTEXT: [],
            searchQuery: '',
            asyncLoading: false,
            asyncLoadingStatus: AsyncQueryLoadingStatus.Success,
            isCallOutVisible: false,
          },
          () => console.log('Successfully updated the states')
        ); // added callback function to handle async issues
      });
    }
  };

  onRunAsync = (queriesString: string): void => {
    // switch to an async query here if using any datasource != Opensearch

    // finding regular query here
    const queries: string[] = getQueries(queriesString);
    const language = this.state.language;
    const currentDataSource = this.state.selectedDatasource[0].label;
    if (queries.length > 0) {
      const responsePromise = Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(ASYNC_QUERY_ENDPOINT, {
              body: JSON.stringify({
                lang: language,
                query,
                datasource: currentDataSource,
                sessionId: getAsyncSessionId(currentDataSource) ?? undefined,
              }),
            })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      );

      Promise.all([responsePromise]).then(([response]) => {
        const results: Array<ResponseDetail<string>> = response.map((resp) =>
          this.processQueryResponse(resp as IHttpResponse<ResponseData>)
        );
        results.map(
          (queryResultResponseDetail: ResponseDetail<string>): ResponseDetail<QueryResult> => {
            if (!queryResultResponseDetail.fulfilled) {
              return {
                fulfilled: queryResultResponseDetail.fulfilled,
                errorMessage: errorQueryResponse(queryResultResponseDetail),
              };
            } else {
              const responseObj = queryResultResponseDetail.data
                ? queryResultResponseDetail.data
                : '';

              const queryId: string = _.get(responseObj, 'queryId');
              setAsyncSessionId(currentDataSource, _.get(responseObj, 'sessionId', null));

              // clear state from previous results and start async loading
              this.setState({
                queryTranslations: [],
                queryResultsTable: [],
                queryResults: [],
                queryResultsCSV: [],
                queryResultsJSON: [],
                queryResultsTEXT: [],
                messages: [],
                selectedTabId: MESSAGE_TAB_LABEL,
                selectedTabName: MESSAGE_TAB_LABEL,
                itemIdToExpandedRowMap: {},
                asyncLoading: true,
                asyncLoadingStatus: AsyncQueryLoadingStatus.Scheduled,
                asyncJobId: queryId,
                isCallOutVisible: false,
              });
              this.callGetStartPolling(queries);
              const interval = setInterval(() => {
                if (!this.state.asyncLoading) {
                  clearInterval(interval);
                }
                this.callGetStartPolling(queries);
              }, POLL_INTERVAL_MS);
            }
          }
        );
      });
    }
  };

  callGetStartPolling = async (queries: string[]) => {
    const nextP = this.httpClient
      .get(ASYNC_QUERY_JOB_ENDPOINT + this.state.asyncJobId)
      .catch((error: any) => {
        this.setState({
          messages: [
            {
              text: error.message,
              className: 'error-message',
            },
          ],
        });
      });

    return await nextP.then((response) => {
      const result: ResponseDetail<string> = this.processQueryResponse(
        response as IHttpResponse<ResponseData>
      );
      const status = result.data.status.toLowerCase();
      if (_.isEqual(status, 'success')) {
        const resultTable: Array<ResponseDetail<QueryResult>> = getQueryResultsForTable(
          [result],
          false
        );
        this.setState({
          queries,
          queryResults: [result],
          queryResultsTable: result.data.schema.length > 0 ? resultTable : [],
          selectedTabId: getDefaultTabId([result]),
          selectedTabName: getDefaultTabLabel([result], queries[0]),
          messages: this.getMessage(resultTable),
          itemIdToExpandedRowMap: {},
          queryResultsJSON: [],
          queryResultsCSV: [],
          queryResultsTEXT: [],
          searchQuery: '',
          asyncLoading: false,
          asyncLoadingStatus: status,
          isCallOutVisible: !(result.data.schema.length > 0),
        });
      } else if (_.isEqual(status, 'failed') || _.isEqual(status, 'cancelled')) {
        this.setState({
          asyncLoading: false,
          asyncLoadingStatus: status,
          messages: [
            {
              text: status,
              className: 'error-message',
            },
          ],
          asyncQueryError: result.data.error,
        });
      } else {
        this.setState({
          asyncLoading: true,
          asyncLoadingStatus: status,
        });
      }
    });
  };

  cancelAsyncQuery = async () => {
    Promise.all([
      this.httpClient
        .delete(ASYNC_QUERY_JOB_ENDPOINT + this.state.asyncJobId)
        .catch((error: any) => {
          this.setState({
            messages: [
              {
                text: error.message,
                className: 'error-message',
              },
            ],
          });
        }),
    ]);
  };

  onTranslate = (queriesString: string): void => {
    const queries: string[] = getQueries(queriesString);
    const language = this.state.language;

    if (queries.length > 0) {
      const endpoint =
        '/api/sql_console/' + (_.isEqual(language, 'SQL') ? 'translatesql' : 'translateppl');
      const translationPromise = Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(endpoint, { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      );

      Promise.all([translationPromise]).then(([translationResponse]) => {
        const translationResult: Array<ResponseDetail<
          TranslateResult
        >> = translationResponse.map((translationResp) =>
          this.processTranslateResponse(translationResp as IHttpResponse<ResponseData>)
        );
        const shouldCleanResults = queries === this.state.queries;
        if (shouldCleanResults) {
          this.setState({
            queries,
            queryTranslations: translationResult,
            messages: this.getTranslateMessage(translationResult),
          });
        } else {
          this.setState(
            {
              queries,
              queryTranslations: translationResult,
              messages: this.getTranslateMessage(translationResult),
            },
            () => console.log('Successfully updated the states')
          );
        }
      });
    }
  };

  getJson = (queries: string[]): void => {
    if (queries.length > 0) {
      Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post('/api/sql_console/sqljson', { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      ).then((response) => {
        const results: Array<ResponseDetail<string>> = response.map((resp) =>
          this.processQueryResponse(resp as IHttpResponse<ResponseData>)
        );
        this.setState(
          {
            queries,
            queryResultsJSON: results,
          },
          () => console.log('Successfully updated the states')
        );
      });
    }
  };

  getJdbc = (queries: string[]): void => {
    const language = this.state.language;
    if (queries.length > 0) {
      const endpoint = '/api/sql_console/' + (_.isEqual(language, 'SQL') ? 'sqlquery' : 'pplquery');
      Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(endpoint, { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      ).then((jdbcResponse) => {
        const jdbcResult: Array<ResponseDetail<string>> = jdbcResponse.map((jdbcResp) =>
          this.processQueryResponse(jdbcResp as IHttpResponse<ResponseData>)
        );
        this.setState(
          {
            queries,
            queryResults: jdbcResult,
          },
          () => console.log('Successfully updated the states')
        );
      });
    }
  };

  getCsv = (queries: string[]): void => {
    const language = this.state.language;
    if (queries.length > 0) {
      const endpoint = '/api/sql_console/' + (_.isEqual(language, 'SQL') ? 'sqlcsv' : 'pplcsv');
      Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(endpoint, { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      ).then((csvResponse) => {
        const csvResult: Array<ResponseDetail<string>> = csvResponse.map((csvResp) =>
          this.processQueryResponse(csvResp as IHttpResponse<ResponseData>)
        );
        this.setState(
          {
            queries,
            queryResultsCSV: csvResult,
          },
          () => console.log('Successfully updated the states')
        );
      });
    }
  };

  getText = (queries: string[]): void => {
    const language = this.state.language;
    if (queries.length > 0) {
      const endpoint = '/api/sql_console/' + (_.isEqual(language, 'SQL') ? 'sqltext' : 'ppltext');
      Promise.all(
        queries.map((query: string) =>
          this.httpClient
            .post(endpoint, { body: JSON.stringify({ query }) })
            .catch((error: any) => {
              this.setState({
                messages: [
                  {
                    text: error.message,
                    className: 'error-message',
                  },
                ],
              });
            })
        )
      ).then((textResponse) => {
        const textResult: Array<ResponseDetail<string>> = textResponse.map((textResp) =>
          this.processQueryResponse(textResp as IHttpResponse<ResponseData>)
        );
        this.setState(
          {
            queries,
            queryResultsTEXT: textResult,
          },
          () => console.log('Successfully updated the states')
        );
      });
    }
  };

  onClear = (): void => {
    this.setState({
      queries: [],
      queryTranslations: [],
      queryResultsTable: [],
      queryResults: [],
      queryResultsCSV: [],
      queryResultsJSON: [],
      queryResultsTEXT: [],
      messages: [],
      selectedTabId: MESSAGE_TAB_LABEL,
      selectedTabName: MESSAGE_TAB_LABEL,
      itemIdToExpandedRowMap: {},
      asyncLoading: false,
      asyncLoadingStatus: AsyncQueryLoadingStatus.Success,
      isCallOutVisible: false,
    });
  };

  onChange = (id: string) => {
    this.setState(
      {
        language: id,
        queryResultsTable: [],
      },
      () => console.log('Successfully updated language to ', this.state.language)
    ); // added callback function to handle async issues
  };

  updateSQLQueries = (query: string) => {
    this.setState({
      sqlQueriesString: query,
    });
  };

  updatePPLQueries(query: string) {
    this.setState({
      pplQueriesString: query,
    });
  }

  setIsResultFullScreen(isFullScreen: boolean) {
    this.setState({
      isResultFullScreen: isFullScreen,
    });
  }

  handleDataSelect = (selectedItems: EuiComboBoxOptionOption[]) => {
    this.updateSQLQueries('');
    this.updatePPLQueries('');
    this.onClear();
    if (selectedItems[0].label === 'OpenSearch' && this.state.language === 'SQL') {
      this.updateSQLQueries(OPENSEARCH_SQL_INIT_QUERY);
    }
    this.setState({
      selectedDatasource: selectedItems,
    });
  };

  handleReloadTree = () => {
    this.setState({
      refreshTree: !this.state.refreshTree,
    });
  };

  setIsAccelerationFlyoutOpened = (value: boolean) => {
    this.setState({
      isAccelerationFlyoutOpened: value,
    });
  };

  render() {
    let page;
    let link;
    let linkTitle;

    if (this.state.language === 'SQL') {
      page = (
        <SQLPage
          http={this.httpClient}
          onRun={
            _.isEqual(this.state.selectedDatasource[0].label, 'OpenSearch')
              ? this.onRun
              : this.onRunAsync
          }
          onTranslate={this.onTranslate}
          onClear={this.onClear}
          sqlQuery={this.state.sqlQueriesString}
          sqlTranslations={this.state.queryTranslations}
          updateSQLQueries={this.updateSQLQueries}
          selectedDatasource={this.state.selectedDatasource}
          asyncLoading={this.state.asyncLoading}
          openAccelerationFlyout={
            this.props.isAccelerationFlyoutOpen && !this.state.isAccelerationFlyoutOpened
          }
          setIsAccelerationFlyoutOpened={this.setIsAccelerationFlyoutOpened}
        />
      );
      link = 'https://opensearch.org/docs/latest/search-plugins/sql/sql/index/';
      linkTitle = 'SQL documentation';
    } else {
      page = (
        <PPLPage
          onRun={
            _.isEqual(this.state.selectedDatasource[0].label, 'OpenSearch')
              ? this.onRun
              : this.onRunAsync
          }
          onTranslate={this.onTranslate}
          onClear={this.onClear}
          pplQuery={this.state.pplQueriesString}
          pplTranslations={this.state.queryTranslations}
          updatePPLQueries={this.updatePPLQueries}
          selectedDatasource={this.state.selectedDatasource}
          asyncLoading={this.state.asyncLoading}
        />
      );
      link = 'https://opensearch.org/docs/latest/search-plugins/sql/ppl/index/';
      linkTitle = 'PPL documentation';
    }

    if (this.state.isResultFullScreen) {
      return (
        <div className="sql-console-query-result">
          <QueryResults
            language={this.state.language}
            queries={this.state.queries}
            queryResults={this.state.queryResultsTable}
            queryResultsJDBC={getSelectedResults(this.state.queryResults, this.state.selectedTabId)}
            queryResultsJSON={getSelectedResults(
              this.state.queryResultsJSON,
              this.state.selectedTabId
            )}
            queryResultsCSV={getSelectedResults(
              this.state.queryResultsCSV,
              this.state.selectedTabId
            )}
            queryResultsTEXT={getSelectedResults(
              this.state.queryResultsTEXT,
              this.state.selectedTabId
            )}
            messages={this.state.messages}
            selectedTabId={this.state.selectedTabId}
            selectedTabName={this.state.selectedTabName}
            onSelectedTabIdChange={this.onSelectedTabIdChange}
            itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
            onQueryChange={this.onQueryChange}
            updateExpandedMap={this.updateExpandedMap}
            searchQuery={this.state.searchQuery}
            tabsOverflow={false}
            getJson={this.getJson}
            getJdbc={this.getJdbc}
            getCsv={this.getCsv}
            getText={this.getText}
            isResultFullScreen={this.state.isResultFullScreen}
            setIsResultFullScreen={this.setIsResultFullScreen}
            asyncLoadingStatus={this.state.asyncLoadingStatus}
            asyncQueryError={this.state.asyncQueryError}
            cancelAsyncQuery={this.cancelAsyncQuery}
            selectedDatasource={this.state.selectedDatasource}
          />
        </div>
      );
    }

    return (
      <>
        <EuiFlexGroup direction="row" alignItems="center">
          <EuiFlexItem>
            <EuiText>Data Sources</EuiText>
            <DataSelect
              http={this.httpClient}
              onSelect={this.handleDataSelect}
              urlDataSource={this.props.urlDataSource}
              asyncLoading={this.state.asyncLoading}
            />
            <EuiSpacer />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Switch
              onChange={this.onChange}
              language={this.state.language}
              asyncLoading={this.state.asyncLoading}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton href={link} target="_blank" iconType="popout" iconSide="right">
              {linkTitle}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiPage paddingSize="none">
          {this.state.language === 'SQL' && (
            <EuiPanel grow={true}>
              <EuiPageSideBar
                style={{
                  maxWidth: '400px',
                  width: '400px',
                  height: 'calc(100vh - 254px)',
                }}
              >
                <EuiFlexGroup direction="row" gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      display="base"
                      iconType="refresh"
                      size="m"
                      aria-label="refresh"
                      onClick={this.handleReloadTree}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <CreateButton
                      updateSQLQueries={this.updateSQLQueries}
                      selectedDatasource={this.state.selectedDatasource}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size="l" />
                <EuiFlexGroup
                  direction="column"
                  style={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    height: 'calc(100vh - 308px)',
                  }}
                >
                  <EuiFlexItem grow={false}>
                    <TableView
                      http={this.httpClient}
                      selectedItems={this.state.selectedDatasource}
                      updateSQLQueries={this.updateSQLQueries}
                      refreshTree={this.state.refreshTree}
                    />
                    <EuiSpacer />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageSideBar>
            </EuiPanel>
          )}

          <EuiPageContent paddingSize="m">
            <EuiPageContentBody>
              <EuiFlexGroup alignItems="center" />
              <EuiSpacer size="l" />
              <div>{page}</div>
              <EuiSpacer size="l" />
              {this.state.isCallOutVisible && (
                <>
                  <EuiCallOut
                    size="s"
                    title="Query Submitted Successfully"
                    color="success"
                    iconType="check"
                    dismissible
                    onDismiss={() =>
                      this.setState({
                        isCallOutVisible: false,
                      })
                    }
                  />
                  <EuiSpacer size="l" />
                </>
              )}
              <div className="sql-console-query-result">
                <QueryResults
                  language={this.state.language}
                  queries={this.state.queries}
                  queryResults={this.state.queryResultsTable}
                  queryResultsJDBC={getSelectedResults(
                    this.state.queryResults,
                    this.state.selectedTabId
                  )}
                  queryResultsJSON={getSelectedResults(
                    this.state.queryResultsJSON,
                    this.state.selectedTabId
                  )}
                  queryResultsCSV={getSelectedResults(
                    this.state.queryResultsCSV,
                    this.state.selectedTabId
                  )}
                  queryResultsTEXT={getSelectedResults(
                    this.state.queryResultsTEXT,
                    this.state.selectedTabId
                  )}
                  messages={this.state.messages}
                  selectedTabId={this.state.selectedTabId}
                  selectedTabName={this.state.selectedTabName}
                  onSelectedTabIdChange={this.onSelectedTabIdChange}
                  itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
                  onQueryChange={this.onQueryChange}
                  updateExpandedMap={this.updateExpandedMap}
                  searchQuery={this.state.searchQuery}
                  tabsOverflow={false}
                  getJson={this.getJson}
                  getJdbc={this.getJdbc}
                  getCsv={this.getCsv}
                  getText={this.getText}
                  isResultFullScreen={this.state.isResultFullScreen}
                  setIsResultFullScreen={this.setIsResultFullScreen}
                  asyncLoadingStatus={this.state.asyncLoadingStatus}
                  asyncQueryError={this.state.asyncQueryError}
                  cancelAsyncQuery={this.cancelAsyncQuery}
                  selectedDatasource={this.state.selectedDatasource}
                />
              </div>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPage>
      </>
    );
  }
}
