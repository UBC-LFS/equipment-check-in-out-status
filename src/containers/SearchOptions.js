import React from 'react'
import { Form } from 'react-bootstrap'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

function SearchOptions ({ query, handleQueryUpdate }) {
  return (
    <section className='search-container'>
      <div className='search'>
        <Form.Control
          as='select' className='search-property dropdown' onChange={(e) => {
            handleQueryUpdate({ ...query, property: e.target.value })
          }}
        >
          <option value='itemType'>Type</option>
          <option value='itemDescription'>Description</option>
          <option value='loanedBy'>Loaned By</option>
        </Form.Control>
        <Form.Control
          as='input' placeholder='Search...' className='search-value'
          onKeyDown={(e) => {
            // check if spacebar was pressed
            if (e.which === 13) {
              handleQueryUpdate({ ...query, value: e.target.value })
            }
          }}
        >
        </Form.Control>
        <section className='dates'>
          <Form.Control
            as='select' className='search-loaned-on dropdown' onChange={(e) => {
              handleQueryUpdate({ ...query, dateParam: e.target.value })
            }}
          >
            <option value='loanedOn'>Loaned On</option>
            <option value='returnedOn'>Returned On</option>
          </Form.Control>
          <div className='date'>
            <label htmlFor='from-date'>From Date</label>
            <DatePicker
              id='from-date'
              className='date form-control'
              ariaLabelledBy='From Date'
              selected={query.fromDate}
              onChange={date => {
                handleQueryUpdate({ ...query, fromDate: date })
              }}
            />
          </div>
          <div className='date'>
            <label htmlFor='to-date'>To Date</label>
            <DatePicker
              id='to-date'
              className='date form-control'
              ariaLabelledBy='To Date'
              selected={query.toDate}
              onChange={date => { handleQueryUpdate({ ...query, toDate: date }) }}
            />
          </div>
        </section>
      </div>
      <small>Type your search query and press ENTER on your keyboard to search</small>
    </section>
  )
}

SearchOptions.propTypes = {
  query: PropTypes.shape({
    property: PropTypes.string.isRequired,
    value: PropTypes.string,
    dateParam: PropTypes.string.isRequired,
    fromDate: PropTypes.instanceOf(Date),
    toDate: PropTypes.instanceOf(Date)
  }),
  handleQueryUpdate: PropTypes.func.isRequired
}

export default SearchOptions
