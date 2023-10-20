/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiCodeBlock,
  EuiCodeEditor,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import 'brace/ext/language_tools';
import 'brace/mode/sql';
import React from 'react';
import { CoreStart } from '../../../../../src/core/public';
import { ResponseDetail, TranslateResult } from '../Main/main';
import { CreateAcceleration } from '../acceleration/create/create_acceleration';

interface SQLPageProps {
  http: CoreStart['http'];
  onRun: (query: string) => void;
  onTranslate: (query: string) => void;
  onClear: () => void;
  updateSQLQueries: (query: string) => void;
  sqlQuery: string;
  sqlTranslations: ResponseDetail<TranslateResult>[];
  selectedDatasource: EuiComboBoxOptionOption[];
  asyncLoading: boolean;
  openAccelerationFlyout: boolean;
  setIsAccelerationFlyoutOpened: (value: boolean) => void;
}

interface SQLPageState {
  sqlQuery: string;
  translation: string;
  isModalVisible: boolean;
  flyoutComponent: JSX.Element;
}

export class SQLPage extends React.Component<SQLPageProps, SQLPageState> {
  constructor(props: SQLPageProps) {
    super(props);
    this.state = {
      sqlQuery: this.props.sqlQuery,
      translation: '',
      isModalVisible: false,
      flyoutComponent: <></>,
    };
  }

  setIsModalVisible(visible: boolean): void {
    this.setState({
      isModalVisible: visible,
    });
  }

  resetFlyout = () => {
    this.setState({ flyoutComponent: <></> });
  };

  setAccelerationFlyout = () => {
    this.setState({
      flyoutComponent: (
        <CreateAcceleration
          http={this.props.http}
          selectedDatasource={this.props.selectedDatasource}
          resetFlyout={this.resetFlyout}
          updateQueries={this.props.updateSQLQueries}
        />
      ),
    });
  };

  componentDidUpdate(prevProps: SQLPageProps) {
    const { selectedDatasource, openAccelerationFlyout } = this.props;
    const prevDataSource = prevProps.selectedDatasource[0].label;
    const currentDataSource = selectedDatasource[0].label;

    if (
      currentDataSource !== prevDataSource &&
      currentDataSource !== 'OpenSearch' &&
      openAccelerationFlyout
    ) {
      this.setAccelerationFlyout();
      this.props.setIsAccelerationFlyoutOpened(true);
    }
  }

  render() {
    const closeModal = () => this.setIsModalVisible(false);
    const showModal = () => this.setIsModalVisible(true);

    const sqlTranslationsNotEmpty = () => {
      if (this.props.sqlTranslations.length > 0) {
        return this.props.sqlTranslations[0].fulfilled;
      }
      return false;
    };

    const explainContent = sqlTranslationsNotEmpty()
      ? this.props.sqlTranslations
          .map((queryTranslation: any) => JSON.stringify(queryTranslation.data, null, 2))
          .join('\n')
      : 'This query is not explainable.';

    let modal;

    if (this.state.isModalVisible) {
      modal = (
        <EuiOverlayMask onClick={closeModal}>
          <EuiModal onClose={closeModal} style={{ width: 800 }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Explain</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiCodeBlock language="json" fontSize="m" isCopyable>
                {explainContent}
              </EuiCodeBlock>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButton onClick={closeModal} fill>
                Close
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    return (
      <>
        <EuiPanel
          className="sql-console-query-editor container-panel coreSystemRootDomElement"
          paddingSize="m"
        >
          <EuiSpacer size="s" />
          <EuiCodeEditor
            mode="sql"
            theme="textmate"
            width="100%"
            height="10rem"
            value={this.props.sqlQuery}
            onChange={this.props.updateSQLQueries}
            showPrintMargin={false}
            setOptions={{
              fontSize: '14px',
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
            }}
            aria-label="Code Editor"
          />
          <EuiSpacer />
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem>
              <EuiFlexGroup className="action-container" gutterSize="m">
                <EuiFlexItem grow={false} onClick={() => this.props.onRun(this.props.sqlQuery)}>
                  <EuiButton
                    fill={true}
                    className="sql-editor-button"
                    isLoading={this.props.asyncLoading}
                  >
                    {this.props.asyncLoading ? 'Running' : 'Run'}
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem
                  grow={false}
                  onClick={() => {
                    this.props.updateSQLQueries('');
                    this.props.onClear();
                  }}
                >
                  <EuiButton className="sql-editor-button" isDisabled={this.props.asyncLoading}>
                    Clear
                  </EuiButton>
                </EuiFlexItem>
                {this.props.selectedDatasource &&
                  this.props.selectedDatasource[0].label === 'OpenSearch' && (
                    <EuiFlexItem
                      grow={false}
                      onClick={() => this.props.onTranslate(this.props.sqlQuery)}
                    >
                      <EuiButton
                        className="sql-editor-button"
                        onClick={showModal}
                        isDisabled={this.props.asyncLoading}
                      >
                        Explain
                      </EuiButton>
                    </EuiFlexItem>
                  )}
              </EuiFlexGroup>
            </EuiFlexItem>
            {this.props.selectedDatasource &&
              this.props.selectedDatasource[0].label !== 'OpenSearch' && (
                <EuiFlexItem grow={false}>
                  <EuiButton
                    className="sql-accelerate-button"
                    onClick={this.setAccelerationFlyout}
                    isDisabled={this.props.asyncLoading}
                  >
                    Accelerate Table
                  </EuiButton>
                </EuiFlexItem>
              )}
          </EuiFlexGroup>
        </EuiPanel>
        {modal}
        {this.state.flyoutComponent}
      </>
    );
  }
}
