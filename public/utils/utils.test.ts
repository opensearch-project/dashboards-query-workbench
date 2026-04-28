/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getQueries
} from './utils';

describe('getQueries', () => {
  it('should return a simple query without issues.', () => {
    expect(getQueries("select 1")).toEqual(["select 1"]);
  });
  it('should split queries by semicolons', () => {
    expect(getQueries("select 1;select 2;select 3"))
      .toEqual(["select 1", "select 2", "select 3"]);
  });
  it('should not choke on opening or closing semicolons', () => {
    expect(getQueries(";;;select 1;;")).toEqual(["select 1"]);
  });
  it('should not split on quoted semi-colons', () => {
    expect(getQueries("select * from x where y = '1;2' or y = '3;4'")).toEqual(
      ["select * from x where y = '1;2' or y = '3;4'"]);
  });
  it('should not split on quoted escaped semi-colons', () => {
    expect(getQueries("select * from x where y = '1\\;2\\;';select * from x where y = '3'")).toEqual(
      ["select * from x where y = '1;2;'", "select * from x where y = '3'"]);
  });
  it('should not get tripped up by nested quotes and escaped semicolons in quotes, either', () => {
    expect(getQueries("select * from x where y = '1\\\\'\\\\';\\;2';select * from x where y = '\\\"3;\\;\\\\'\\\\'4;'")).toEqual(
      ["select * from x where y = '1\\'\\';;2'", "select * from x where y = '\"3;;\\'\\'4;'"]);
  });
});

