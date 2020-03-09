import React, { useState, useEffect } from 'react'

import LoanTables from './containers/LoanTables'

function App () {
  const [loans, updateLoans] = useState({ fetched: false, equipmentList: [] })

  // initially fetch the list of loans
  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(loans => {
        updateLoans({ fetched: true, equipmentList: loans })
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  return <LoanTables loans={loans} />
}

export default App
