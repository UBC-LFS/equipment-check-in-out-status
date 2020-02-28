import { Table } from "react-bootstrap"
import PropTypes from "prop-types"

function ItemTable({title, items}) {
    return (
    <div className="table-container">
      <h2>Items signed out ({items.length})</h2>
      <Table striped hover size="md" className="loan-table">
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
          <tr key={"row-"+item.responseId}>
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
    );
}

ItemTable.propTypes = {
    title: PropTypes.string,
    items: PropTypes.array.isRequired
};

export default ItemTable;