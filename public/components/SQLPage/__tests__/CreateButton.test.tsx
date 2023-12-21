import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CreateButton } from '../CreateButton';

describe('CreateButton', () => {
  const mockUpdateSQLQueries = jest.fn();

  const mockSelectedDatasource = [{ label: 'glue_1' }];

  it('opens and closes the popover', async () => {
    render(
      <CreateButton
        updateSQLQueries={mockUpdateSQLQueries}
        selectedDatasource={mockSelectedDatasource}
      />
    );

    expect(screen.queryByText('Create Database')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Spark SQL')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Spark SQL'));
    
    expect(document.body.children[0]).toMatchSnapshot();

   
    await waitFor(() => {
      expect(screen.queryByText('Create Database')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();

  });

  it('selects an option in the Spark SQL submenu', async () => {
    render(
      <CreateButton
        updateSQLQueries={mockUpdateSQLQueries}
        selectedDatasource={mockSelectedDatasource}
      />
    );

    fireEvent.click(screen.getByText('Create'));

    fireEvent.click(screen.getByText('Spark SQL'));

    await waitFor(() => {
      expect(screen.getByText('Create Database')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Database'));

    expect(mockUpdateSQLQueries).toHaveBeenCalledWith(`CREATE DATABASE datasource.database`);
  });

});
