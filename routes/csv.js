const express = require('express');
const routerLib = express.Router;
const router = routerLib();
const request = require('request');
const pickBy = require('lodash/pickBy');
const values = require('lodash/values');

function api2csv(apiResponse) {
  const csv = [];
  const headers = [
    'OCID',
    'Contract title',
    'Suppliers name',
    'Buyer name',
    'Buyer parent',
    'Total amount',
    'Procurement method',
    'Start date',
    'End date',
    'Contract amount',
    'Contract currency',
    'Source',
  ];

  csv.push(headers);
  // console.log(apiResponse);
  for (const r in apiResponse.data) {
    if (Object.prototype.hasOwnProperty.call(apiResponse.data, r)) {
      const item = apiResponse.data[r];
      // console.log(item.rsecords[0].compiledRelease);
      const buyerParty = values(pickBy(item.records[0].compiledRelease.parties, i => i.id === item.records[0].compiledRelease.buyer.id));
      // console.log(buyerParty,item.records[0].compiledRelease.buyer.id);

      for (const c in item.records[0].compiledRelease.contracts) {
        if (Object.prototype.hasOwnProperty.call(item.records[0].compiledRelease.contracts, c)) {
          const award = pickBy(item.records[0].compiledRelease.awards, i => i.id === item.records[0].compiledRelease.contracts[c].awardID);
          const row = [
            item.records[0].ocid,
            item.records[0].compiledRelease.contracts[c].title.toString().replace(/"/g, '\''),
            values(award)[0].suppliers[0].name.replace(/"/g, '\''), // .suppliers.name
            buyerParty[0].name.replace(/"/g, '\''),
            buyerParty[0].memberOf[0].name.replace(/"/g, '\''),
            item.records[0].compiledRelease.total_amount,
            item.records[0].compiledRelease.tender.procurementMethod,
            item.records[0].compiledRelease.contracts[c].period.startDate,
            item.records[0].compiledRelease.contracts[c].period.endDate,
            item.records[0].compiledRelease.contracts[c].value.amount,
            item.records[0].compiledRelease.contracts[c].value.currency,
            item.records[0].compiledRelease.source,
          ];

          csv.push(`"${row.join('","')}"`);
        }
      }
    }
  }
  return csv.join('\n');
}


router.get('/:collection', async(req, res) => {
  // console.log("get");
  const limit = 1000;
  const params = `&fields=records.ocid,records.compiledRelease.buyer.id,records.compiledRelease.buyer.name,records.compiledRelease.contracts.title,records.compiledRelease.contracts.awardID,records.compiledRelease.awards.suppliers.name,,records.compiledRelease.awards.id,records.compiledRelease.parties,records.compiledRelease.total_amount,records.compiledRelease.tender.procurementMethod,records.compiledRelease.contracts.period.startDate,records.compiledRelease.contracts.period.endDate,records.compiledRelease.contracts.value,records.compiledRelease.source&limit=${limit}`;
  const question = (req.originalUrl.indexOf('?') === -1 ? '?' : '');
  const url = `http://${req.headers.host + req.originalUrl.replace('csv/', '')}${question}${params}`;

  // console.log(url);

  request(url, (req2, res2, response) => {
    // console.log(response);
    const csv = api2csv(JSON.parse(response));

    res.set('Content-Type', 'text/plain');
    res.send(csv);
  });
});



// function getApi(url,callback) {
//
//
//     var base = 'rest';
//
//     // Set the callback if no params are passed
//     if (typeof params === 'function') {
//       callback = params;
//       params = {};
//     }
//
//     // Set API base
//     if (typeof params.base !== 'undefined') {
//       base = params.base;
//       delete params.base;
//     }
//
//     // Build the options to pass to our custom request object
//     var options = {
//       method: method.toLowerCase(),  // Request method - get || post
//       url: this.__buildEndpoint(path, base) // Generate url
//     };
//
//     // Pass url parameters if get
//     if (method === 'get') {
//       options.qs = params;
//     }
//
//     // Pass form data if post
//     if (method === 'post') {
//       var formKey = 'form';
//
//       options[formKey] = params;
//     }
//
//     console.log("node-qqw API request:",options);
//
//     this.request(options, function(error, response, data) {
//       // request error
//       // console.log("node-qqw API response:",error,response,data);
//       if (error) {
//         return callback(error, data, response);
//       }
//       // JSON parse error or empty strings
//       try {
//         console.log("node-qqw API response:",response.request.href);
//         // An empty string is a valid response
//         if (data === '') {
//           data = {};
//         }
//         else {
//           data = JSON.parse(data);
//           data.api_url = response.request.href;
//         }
//       }
//       catch(parseError) {
//         return callback(
//           new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
//           data,
//           response
//         );
//       }
//
//
//       // response object errors
//       // This should return an error object not an array of errors
//       if (data.errors !== undefined) {
//         return callback(data.errors, data, response);
//       }
//
//       // status code errors
//       if(response.statusCode < 200 || response.statusCode > 299) {
//         return callback(
//           new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage),
//           data,
//           response
//         );
//       }
//       // no errors
//       // console.log("qqw request:",null, data, response)
//       callback(null, data, response);
//     });
//
//
//
// }

module.exports = router;
