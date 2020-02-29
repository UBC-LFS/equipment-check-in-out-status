import React from 'react';
import { render } from '@testing-library/react';

import LoanTables from '../containers/LoanTables';

test('loading screen persists while data is fetching', () => {
    const mockLoansState = {
        fetched: false,
        equipmentList: []
    }

    const { container, getByText } = render(<LoanTables loans={mockLoansState}/>);
    expect(getByText("Loading data...")).toBeInTheDocument();
    expect(container.querySelector("table")).toBeFalsy();
});

test('empty equipment list renders table headers', () => {
    const mockLoansState = {
        fetched: true,
        equipmentList: []
    }
    const { container } = render(<LoanTables loans={mockLoansState} />);
    
    expect(container.querySelector("table")).toBeInstanceOf(HTMLTableElement);
    expect(container.querySelectorAll("table")).toHaveLength(2);
    expect(container.querySelector("td")).toBeNull();
});

test('non-empty equipment list renders table rows', () => {
    const mockLoansState = {
        fetched: true,
        equipmentList: [
            {
                "responseId": "R_a1",
                "itemType": "Cable",
                "itemDescription": "HDMI 0707",
                "loanedBy": "1234",
                "loanedOn": "2/10/2020 2:30:00 PM",
                "returnedOn": null,
                "toBeReturnedOn": "2/15/2020 10:00:00 AM"
            }
        ]
    }

    const { container, getByText } = render(<LoanTables loans={mockLoansState} />);

    expect(container.querySelector("#signed-out td")).toBeTruthy();
    expect(getByText("Cable")).toBeInTheDocument();
});