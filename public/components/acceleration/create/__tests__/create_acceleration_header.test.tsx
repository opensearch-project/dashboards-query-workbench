/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { CreateAccelerationHeader } from '../create_acceleration_header';

describe('Acceleration header', () => {
  configure({ adapter: new Adapter() });

  it('renders acceleration flyout header', async () => {
    const wrapper = mount((<CreateAccelerationHeader />) as React.ReactElement<any>);
    wrapper.update();
    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
