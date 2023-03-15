/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import React from "react";
import _ from "lodash";
import { EuiButtonGroup } from "@elastic/eui";
// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";

interface SwitchProps {
    onChange: (id: string, value?: any) => void;
    language: string;
}

interface SwitchState {
    // language: string
}

const toggleButtons = [
    {
        id: 'SQL',
        label: 'SQL',
        'data-test-subj': 'workbench-sql-language-button',
    },
    {
        id: 'PPL',
        label: 'PPL',
        'data-test-subj': 'workbench-ppl-language-button',
    },
];

class Switch extends React.Component<SwitchProps, SwitchState> {
    constructor(props: SwitchProps) {
        super(props);
        this.state = {
            language: 'SQL'
        };
    }

    render() {

        return (
            <EuiButtonGroup className="query-language-switch"
                legend="query-language-swtich"
                options={toggleButtons}
                onChange={(id) => this.props.onChange(id)}
                idSelected={this.props.language}
                buttonSize="m"
            />
        )
    }
}

export default Switch;
