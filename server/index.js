const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

const { fetchJSONResponseReport } = require('./utils')

const PORT = process.env.PORT || 4000

const targetSurveyName = process.env.SURVEY_NAME
const downloadEveryMinutes = 10

// configure .env file
require('dotenv').config()

/**
 * Generates object containing all loans mapped to their corresponding student/employee number
 * @return {Promise} a promise that resolves to a student/employee number loan mapping object
*/
const generateOutputJSON = async () => {
  let jsonResponses = {}
  let fileModifiedOn

  try {
    const { mtimeMs } = fs.statSync(targetSurveyName + '.json')
    fileModifiedOn = Math.floor(mtimeMs)
  } catch (e) {
    // console.log(e);
    fileModifiedOn = null
  }

  if (!fileModifiedOn || Date.now() - fileModifiedOn >= downloadEveryMinutes * 60000) {
    console.log(`File not found or created more than ${downloadEveryMinutes} minutes ago. Downloading..."`)
    jsonResponses = await fetchJSONResponseReport(targetSurveyName)
  } else {
    console.log('Recent file found. Reading content...')
    jsonResponses = JSON.parse(fs.readFileSync(targetSurveyName + '.json'))
  }

  if (jsonResponses.responses) {
    // create empty array that will contain items loaned
    const facultyLoans = []

    let countNoRefLoan = 0

    jsonResponses.responses.forEach((bookingResponse, idx) => {
      const studentEmployeeNumber = bookingResponse.values.QID11_TEXT
      const actionType = bookingResponse.values.QID3

      // check whether user loaned or returned
      // "Loan" is 1, "Return" is 2
      if (actionType === 1) {
        // traverse list of items borrowed
        bookingResponse.values.QID1.forEach((subId, index) => {
          // initialize object containing loan details
          const itemLoanDetails = {
            responseId: bookingResponse.responseId,
            itemType: null,
            itemDescription: null,
            loanedBy: studentEmployeeNumber || null,
            loanedOn: null,
            returnedOn: null,
            toBeReturnedOn: null
          }

          // set the loan date
          itemLoanDetails.loanedOn = new Date(bookingResponse.values.endDate).toLocaleString()

          // attempt to parse the toBeReturnedOn date
          const [rawToBeReturnedDate, rawToBeReturnedTime] = [bookingResponse.values.QID8_TEXT, bookingResponse.values.QID10_TEXT]

          try {
            const parsedToBeReturnedOn = Date.parse(`${rawToBeReturnedDate} ${rawToBeReturnedTime}`)

            if (isNaN(parsedToBeReturnedOn)) {
              throw Error('Invalid date.')
            }

            itemLoanDetails.toBeReturnedOn = new Date(parsedToBeReturnedOn).toLocaleString()
          } catch (e) {
            // console.log(`ERROR: Could not convert ${rawToBeReturnedDate + " " + rawToBeReturnedTime} to ISO format. Date will be added as shown.\n`);
            itemLoanDetails.toBeReturnedOn = `${rawToBeReturnedDate} ${rawToBeReturnedTime}`
          }

          itemLoanDetails.itemType = bookingResponse.labels.QID1[index]
          itemLoanDetails.itemDescription = bookingResponse.values['QID1_' + subId + '_TEXT'] || 'N/A'

          facultyLoans.push(itemLoanDetails)
        })
      } else {
        const returnItems = []

        // check all the items in a return survey response
        bookingResponse.values.QID1.forEach((subId, index) => {
          const item = {
            responseId: bookingResponse.responseId,
            itemType: bookingResponse.labels.QID1[index],
            itemDescription: bookingResponse.values['QID1_' + subId + '_TEXT'] || 'N/A',
            loanedBy: studentEmployeeNumber || null,
            returnedOn: new Date(bookingResponse.values.endDate).toLocaleString(),
            hasReferenceLoan: false
          }

          returnItems.push(item)
        })

        // counter for matched item returns (used to stop searching when matches for all returns were found)
        let countMatchedReturns = 0

        for (let loanIndex = 0; loanIndex < facultyLoans.length; loanIndex++) {
          const loanItem = facultyLoans[loanIndex]

          returnItems.forEach(returnItem => {
            // check match conditions
            if (returnItem.loanedBy === loanItem.loanedBy &&
                Date.parse(returnItem.returnedOn) >= Date.parse(loanItem.loanedOn) &&
                loanItem.returnedOn == null &&
                returnItem.itemType === loanItem.itemType) {
              countMatchedReturns++
              loanItem.returnedOn = returnItem.returnedOn
              returnItem.hasReferenceLoan = true
            }
          })

          if (countMatchedReturns === returnItems.length) { break }
        }

        returnItems.forEach(returnItem => {
          if (returnItem.hasReferenceLoan === false) {
            countNoRefLoan++
            facultyLoans.push(returnItem)
          }
        })
      }
    })

    console.log(`Total returns with no loan: ${countNoRefLoan}`)
    return facultyLoans
  }

  return []
}

const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('morgan')('dev'))
}

// set up cors
app.use(cors())

// parse request body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// loans endpoint
app.get('/api/loans', (req, res) => {
  generateOutputJSON()
    .then(loans => res.json(loans))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
})

app.use(express.static('build'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => { console.log(`App listening on port ${PORT}.`) })
