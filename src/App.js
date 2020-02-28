import React, {useState, useEffect} from 'react';
import { Table } from 'react-bootstrap';

import SearchOptions from "./containers/SearchOptions";

function App() {
  
  const [loans, updateLoans] = useState({ fetched: false, equipmentList: [] });
  const [currentQuery, updateCurrentQuery] = useState({property: "itemType", value: null});
  const [queryLoanList, updateQueryLoanList] = useState([]);

  function filterWithQuery(arr, property, value, dateParameter=null, fromDate=null, toDate=null) {
    if(!property || !value) {
      return arr;
    }

    const regex = new RegExp(value, "i");
    return arr.filter( el => {
      if(el[property])
        return el[property].match(regex);

      return false;
      });
  }

  // initially fetch the list of loans
  useEffect(() => {
    fetch("/api/loans")
    .then(res => res.json())
    .then(loans => {
      updateLoans({fetched: true, equipmentList: loans});
      //updateQueryLoanList(loans);
    }); 
  }, []);

  // run filters when query changes
  useEffect(() => {
    updateQueryLoanList(filterWithQuery(loans.equipmentList, currentQuery.property, currentQuery.value));
  }, [loans, currentQuery]);

  const signedOutItems = [];
  const returnedItems = [];
  const unmatchedItems = [];

  // add data to the tableData object
  queryLoanList.forEach( singleLoan => {
  
      // put item in its corresponding list
      if(!singleLoan.loanedOn) {
        unmatchedItems.push({
          responseId: singleLoan.responseId,
          itemType: singleLoan.itemType,
          itemDescription: singleLoan.itemDescription,
          loanedBy: singleLoan.loanedBy,
          returnedOn: singleLoan.returnedOn
        });
      }
      else if(singleLoan.returnedOn == null){
        signedOutItems.push({
          responseId: singleLoan.responseId,
          itemType: singleLoan.itemType,
          itemDescription: singleLoan.itemDescription,
          loanedBy: singleLoan.loanedBy,
          loanedOn: singleLoan.loanedOn,
          toBeReturnedOn: singleLoan.toBeReturnedOn
        });
      }
      else {
        returnedItems.push({
          responseId: singleLoan.responseId,
          itemType: singleLoan.itemType,
          itemDescription: singleLoan.itemDescription,
          loanedBy: singleLoan.loanedBy,
          loanedOn: singleLoan.loanedOn,
          returnedOn: singleLoan.returnedOn
        });
      }

  });

  // sort arrays by descending date
  try {
    signedOutItems.sort( (a,b) => Date.parse(b.loanedOn) - Date.parse(a.loanedOn));
    returnedItems.sort( (a,b) => Date.parse(b.loanedOn) - Date.parse(a.loanedOn));
    unmatchedItems.sort( (a,b) => Date.parse(b.returnedOn) - Date.parse(a.returnedOn));
  }
  catch(e) {}

  console.log("Rerender!");

  if(!loans.fetched)
    return (
      <div style={{padding: "15px"}}>
        <strong>Loading data...</strong><br />
        The server might take a second to download and process the report
      </div>
    );

  return (
    <div className="main-container">
      <SearchOptions query={currentQuery} handleQueryUpdate={updateCurrentQuery} /> 
      <section className="table-section">
        <div className="table-container">
          <h2>Items signed out ({signedOutItems.length})</h2>
          <Table striped hover className="loan-table">
            <thead>          
              <tr>
                <th>Type</th>
                <th>Description</th>  
                <th>Loaned By</th>
                <th>Loaned On</th>
                <th>Will Return On</th>         
              </tr>
            </thead>
            <tbody>
            {signedOutItems.map(item => (
              <tr key={"row-"+item.responseId+item.itemType}>
                <td key={"item-type-"+item.responseId}><strong>{item.itemType}</strong></td>
                <td key={"item-desc-"+item.responseId}>{item.itemDescription}</td>
                <td key={"loaned-by-"+item.responseId}>{item.loanedBy}</td>
                <td key={"loaned-on-"+item.responseId}>{item.loanedOn}</td>
                <td key={"will-return-"+item.responseId}>{item.toBeReturnedOn}</td>
              </tr>
            ))}
            </tbody>
          </Table>
        </div>
      
      <div className="table-container">
        <h2>Items Returned ({returnedItems.length})</h2>
        <Table striped hover className="loan-table">
        <thead>          
            <tr>
              <th>Type</th>
              <th>Description</th>  
              <th>Loaned By</th>
              <th>Loaned On</th>
              <th>Returned On</th>         
            </tr>
          </thead>
          <tbody>
          {returnedItems.map( item => (
            <tr key={"row-"+item.responseId+item.itemType}>
              <td key={"item-type-"+item.responseId}><strong>{item.itemType}</strong></td>
              <td key={"item-desc-"+item.responseId}>{item.itemDescription}</td>
              <td key={"loaned-by-"+item.responseId}>{item.loanedBy}</td>
              <td key={"loaned-on-"+item.responseId}>{item.loanedOn}</td>
              <td key={"will-return-"+item.responseId}>{item.returnedOn}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      </div>
      {/*
      <div className="table-container">
        <h2>Unmatched returns ({unmatchedItems.length})</h2>
        <Table striped hover className="loan-table">
        <thead>          
            <tr>
              <th>Type</th>
              <th>Description</th>  
              <th>Returned By</th>
              <th>Returned On</th>         
            </tr>
          </thead>
          <tbody>
          {unmatchedItems.map( item => (
            <tr key={"row-"+item.responseId+item.itemType}>
              <td key={"item-type-"+item.responseId}><strong>{item.itemType}</strong></td>
              <td key={"item-desc-"+item.responseId}>{item.itemDescription}</td>
              <td key={"loaned-by-"+item.responseId}>{item.loanedBy}</td>
              <td key={"will-return-"+item.responseId}>{item.returnedOn}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      </div>
        */}
      </section>
    </div>
  );
}

export default App;
