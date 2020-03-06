const { createResponseExport, getResponseExportProgress, getResponseExportFile } = require('node-qualtrics-api')

const fs = require('fs')
const JSZip = require('jszip')

/**
 * Donwloads a compressed file containing a new response export
 * @param {String} survey name of the survey
 * @param {String} format file format (can be csv, tsv, spss, json, ndjson, or xml)
 * @param {String} fileName name of output file
 * @return {Promise} A promise that resolves to an object containing the compressed folder's name
*/
const downloadResponseReportZIP = async (survey, format, fileName) => {
  let exportProgressId

  // initiate the response export
  const responseExport = await createResponseExport(survey, format)

  // if the export was initiated successfully, get progress ID
  if (responseExport.result && responseExport.result.progressId) {
    exportProgressId = responseExport.result.progressId

    let exportStatus

    // get the response progress
    let responseExportProgress = await getResponseExportProgress(survey, exportProgressId)

    if (responseExportProgress.result) {
      exportStatus = responseExportProgress.result.status

      // check export status until it completes or fails
      while (exportStatus !== 'complete') {
        responseExportProgress = await getResponseExportProgress(survey, exportProgressId)
        exportStatus = responseExportProgress.result.status

        if (exportStatus === 'failed' || typeof exportStatus === 'undefined') {
          return { error: true, description: 'Qualtrics export failed' }
        }
      }

      const { fileId } = responseExportProgress.result
      const exportFile = await getResponseExportFile(survey, fileId)

      if (Buffer.isBuffer(exportFile)) {
        console.log('Creating zip file...')

        // remove spaces from filename
        fileName = fileName.replace(' ', '')
        const zipFileName = /.zip$/.test(fileName) ? fileName : fileName + '.zip'

        // create zip file containing the response report
        fs.writeFileSync(zipFileName, exportFile)

        console.log('Zip file created successfully.\n')
        return { error: false, description: 'Zip file created successfully.', fileName: zipFileName }
      }
    }
  }
}

/**
 * Donwloads a compressed file containing a new response export
 * @param {String} filePath relative path to file
*/
const unzipResponseReport = async (filePath) => {
  // check that the file requested is a zip file
  const zipFileName = filePath.match(/[a-z0-9_-]\.zip$/i)

  // check if a zip file was correctly included at the end of the path
  if (!zipFileName) { throw new Error('invalid .zip file path ' + `[ ${filePath} ]\n`) }

  console.log('Unzipping folder...')

  const data = fs.readFileSync(filePath)

  const zip = new JSZip()

  const contents = await zip.loadAsync(data)

  for (const filename of Object.keys(contents.files)) {
    const content = await zip.file(filename).async('nodebuffer')
    fs.writeFileSync(filename, content)
  }

  console.log('Folder unzipped successfully.\n')
}

/**
 * Donwloads a JSON file containing all responses
 * @param {String} surveyName name of the survey whose responses are being requested
 * @return {Promise} promise that resolves to a JSON object containing response export data
*/
const fetchJSONResponseReport = async (surveyName) => {
  // download the file from qualtrics
  const download = await downloadResponseReportZIP(surveyName, 'json', surveyName)

  // on the event of a download error, throw the error
  if (download.error) { throw download.error }

  // unzip the response report compressed folder
  await unzipResponseReport(download.fileName)

  // get the file contents and return
  return JSON.parse(fs.readFileSync(surveyName + '.json'))
}

module.exports = { downloadResponseReportZIP, unzipResponseReport, fetchJSONResponseReport }
