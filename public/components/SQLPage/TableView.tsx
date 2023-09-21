/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import React from "react";
import {
  EuiIcon,
  EuiTreeView
} from "@elastic/eui";
import _ from 'lodash';

export const TableView =({tablenames}) =>{
    let treeData;
    if(tablenames.length >0){
        treeData = tablenames.map((element,index)=>({
            label: element,
            icon: <EuiIcon type='tableDensityNormal' size="m" /> ,
            id:'element_'+index
        }))
    }
    return (
        <>
            {tablenames.length>0?
                <EuiTreeView
                aria-label = "Sample Folder Tree"
                items = {treeData}
                aria-labelledby=""
                />
            :null}
        </>
    )

}

