import React, {useState, useEffect} from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function SearchOptions({query, handleQueryUpdate}) {
    const [dateParam, setDateParam] = useState("loanedOn");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    useEffect(() => {
        console.log(fromDate instanceof Date, toDate instanceof Date);
    }, [dateParam, fromDate, toDate]);

    return (
    <section className="search-container">
        <div className="search">
            <Form.Control as="select" className="search-property dropdown" onChange={ (e) => { 
                handleQueryUpdate({...query, property: e.target.value })
            }}>
                <option value="itemType">Type</option>
                <option value="itemDescription">Description</option>
                <option value="loanedBy">Loaned By</option>
            </Form.Control>
            <Form.Control as="input" placeholder="Search..." className="search-value" 
                onKeyDown={(e) => { 
                    // check if spacebar was pressed
                    if(e.which === 13) {
                        handleQueryUpdate({...query, value: e.target.value});
                    }
            }}>
            </Form.Control>
            <section className="dates">
                <Form.Control as="select" className="search-loaned-on dropdown" onChange={(e) => {
                    setDateParam(e.target.value);
                }}>
                    <option value="loanedOn">Loaned On</option>
                </Form.Control>
                <div className="date">
                    <label htmlFor="from-date">From Date</label>
                    <DatePicker 
                        id="from-date"
                        className="date form-control" 
                        ariaLabelledBy="From Date"
                        selected={fromDate} 
                        onChange={date => { setFromDate(date) }}/>
                </div>
                <div className="date">
                    <label htmlFor="to-date">To Date</label>
                    <DatePicker
                        id="to-date" 
                        className="date form-control" 
                        ariaLabelledBy="To Date"
                        selected={toDate} 
                        onChange={date => { setToDate(date) } } />
                </div>
            </section>
        </div>
        <small>Type your search query and press ENTER on your keyboard to search</small>
    </section>
    );
}

SearchOptions.propTypes = {
    query: PropTypes.shape({
        property: PropTypes.string,
        value: PropTypes.string
    }),
    handleQueryUpdate: PropTypes.func.isRequired
};

export default SearchOptions;