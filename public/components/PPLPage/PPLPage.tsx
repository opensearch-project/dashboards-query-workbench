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
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { SAMPLE_PPL_QUERY } from '../../../common/constants';
import { ResponseDetail, TranslateResult } from '../Main/main';

interface PPLPageProps {
  onRun: (query: string) => void;
  onTranslate: (query: string) => void;
  onClear: () => void;
  updatePPLQueries: (query: string) => void;
  pplQuery: string;
  pplTranslations: Array<ResponseDetail<TranslateResult>>;
  selectedDatasource: EuiComboBoxOptionOption[];
  asyncLoading: boolean;
}

interface PPLPageState {
  pplQuery: string;
  translation: string;
  isModalVisible: boolean;
}

export class PPLPage extends React.Component<PPLPageProps, PPLPageState> {
  constructor(props: PPLPageProps) {
    super(props);
    this.state = {
      pplQuery: this.props.pplQuery,
      translation: '',
      isModalVisible: false,
    };
  }

  setIsModalVisible(visible: boolean): void {
    this.setState({
      isModalVisible: visible,
    });
  }

  render() {
    const closeModal = () => this.setIsModalVisible(false);
    const showModal = () => this.setIsModalVisible(true);

    const pplTranslationsNotEmpty = () => {
      if (this.props.pplTranslations.length > 0) {
        return this.props.pplTranslations[0].fulfilled;
      }
      return false;
    };

    const explainContent = pplTranslationsNotEmpty()
      ? this.props.pplTranslations
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
      <EuiPanel
        className="sql-console-query-editor container-panel coreSystemRootDomElement"
        paddingSize="l"
      >
        <EuiText className="sql-query-panel-header">
          <h3>Query editor</h3>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiCodeEditor
          theme="textmate"
          width="100%"
          height="10rem"
          value={this.props.pplQuery}
          onChange={this.props.updatePPLQueries}
          showPrintMargin={false}
          setOptions={{
            fontSize: '14px',
            showLineNumbers: false,
            showGutter: false,
          }}
          aria-label="Code Editor"
        />
        <EuiSpacer />
        <EuiFlexGroup className="action-container" gutterSize="m">
          <EuiFlexItem
            className="sql-editor-buttons"
            grow={false}
          >
            <EuiButton
              fill={true}
              data-test-subj="pplRunButton"
              className="sql-editor-button"
              isLoading={this.props.asyncLoading}
              onClick={() => this.props.onRun(this.props.pplQuery)}
            >
              {this.props.asyncLoading ? 'Running' : 'Run'}
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem
            grow={false}
            onClick={() => {
              this.props.updatePPLQueries('');
              this.props.onClear();
            }}
          >
            <EuiButton className="sql-editor-button"  data-test-subj="pplClearButton" isDisabled={this.props.asyncLoading}>
              Clear
            </EuiButton>
          </EuiFlexItem>
          {this.props.selectedDatasource &&
          this.props.selectedDatasource[0].label === 'OpenSearch' ? (
            <EuiFlexItem grow={false} onClick={() => this.props.onTranslate(this.props.pplQuery)}>
              <EuiButton
                className="sql-editor-button"
                onClick={showModal}
                isDisabled={this.props.asyncLoading}
              >
                Explain
              </EuiButton>
            </EuiFlexItem>
          ) : (
            <EuiFlexItem grow={false} onClick={() => this.props.updatePPLQueries(SAMPLE_PPL_QUERY)}>
              <EuiButton className="sql-editor-button" isDisabled={this.props.asyncLoading}>
                Sample Query
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        {modal}
      </EuiPanel>
    );
  }
}
