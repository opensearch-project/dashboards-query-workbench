/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import React, { useState, useEffect } from "react";
import { EuiIcon, EuiTreeView } from "@elastic/eui";
import _ from 'lodash';
import { CoreStart } from '../../../../../src/core/public';
import { ON_LOAD_QUERY } from "../../../common/constants";

interface CustomView {
    http: CoreStart['http']
}

export const TableView = ({ http }: CustomView) => {
    const [tablenames, setTablenames] = useState<string[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [childData, setChildData] = useState<string[]>([]);
    const [selectedChildNode, setSelectedChildNode] = useState<string | null>(null);
    const [indexData, setIndexedData] = useState<string[]>([]);

    const getSidebarContent = () => {
        const query = { query: ON_LOAD_QUERY }
        http
            .post(`../api/sql_console/sqlquery`, {
                body: JSON.stringify(query),
            })
            .then((res) => {
                const responseObj = res.data.resp
                    ? JSON.parse(res.data.resp)
                    : '';
                const datarows: any[][] = _.get(responseObj, 'datarows');
                const fields = datarows.map((data) => {
                    return data[2]
                })
                setTablenames(fields)
            })
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        
        getSidebarContent();
    }, []); 

    const handleNodeClick = (nodeLabel: string) => {

        //         // will update after new query

        const newData = ["Child 1", "Child 2", "Child 3"]; 
        setChildData(newData);
        setSelectedNode(nodeLabel);
    };

    const handleChildClick = (nodeLabel1: string) => {

        // will update after new query

        const newData1 = ["Child 4", "Child 5", "Child 6"]; 
        setIndexedData(newData1);
        setSelectedChildNode(nodeLabel1);
    };


    const treeData = tablenames.map((element, index) => ({
        label: element,
        icon: <EuiIcon type='database' size="m" />,
        id: 'element_' + index,
        callback: () => handleNodeClick(element),
        isSelectable: true, 
        isExpanded: true,
        children: selectedNode === element ? childData.map(child => ({
            label: child,
            id: `${element}_${child}`,
            icon: <EuiIcon type='tableDensityCompact' size="s" />,
            callback: () => handleChildClick(child),
            sSelectable: true, 
            isExpanded: true,
            children: selectedChildNode === child ? indexData.map(indexChild => ({
                label: indexChild,
                id: `${child}_${indexChild}`,
                icon: <EuiIcon type='bolt' size="s" />
            })):undefined,
        })) : undefined,
    }));

    return (
        <>
            <EuiTreeView
                aria-label="Sample Folder Tree"
                items={treeData}
                aria-labelledby=""
            />
        </>
    )
}

