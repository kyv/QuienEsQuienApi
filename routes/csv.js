const express = require('express');
const routerLib = express.Router;
const router = routerLib();
const request = require('request');
const pickBy = require('lodash/pickBy');
const values = require('lodash/values');

function api2csv(apiResponse, collection, debug) {
  const csv = [];
  const headers = {
    contracts: [
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
    ],
    persons: ['id', 'name', 'contract_amount_supplier', 'contract_count_supplier'],
    institutions: ['id', 'name', 'classification', 'subclassification', 'contract_amount_supplier', 'contract_count_supplier', 'contract_amount_buyer', 'contract_count_buyer'],
    companies: ['id', 'name', 'classification', 'subclassification', 'contract_amount_supplier', 'contract_count_supplier', 'contract_amount_buyer', 'contract_count_buyer'],
  };

  csv.push(headers[collection]);

  if (debug) {
    console.log("api2csv",apiResponse);
  }
  for (const r in apiResponse.data) {
    if (Object.prototype.hasOwnProperty.call(apiResponse.data, r)) {
      const item = apiResponse.data[r];

      switch (collection) {
      case 'contracts': {
        for (const r in item.records) {
          const record = item.records[r];
          // console.log(record.compiledRelease);
          const buyerParty = values(pickBy(record.compiledRelease.parties, i => i.roles[0] == "buyer"));
          if (!buyerParty) { buyerParty = [{name:"(desconocido)", memberOf:[{name:"(desconocido)"}]}] }
          // console.log(JSON.stringify(buyerParty[0],null,4));

          for (const c in record.compiledRelease.contracts) {
            if (Object.prototype.hasOwnProperty.call(record.compiledRelease.contracts, c)) {
              try {
                const award = pickBy(record.compiledRelease.awards, i => i.id === record.compiledRelease.contracts[c].awardID);
                const suppliersNames = values(award)[0].suppliers.map(s => { if (s.name.toString()) { return s.name.replace(/"/g, '\'')}}).join(";");
                const sources = (record.compiledRelease.source) ? record.compiledRelease.source.map(s => s.url.replace(/ /g,"%20")).join(" ") : "";

                // console.log("source",JSON.stringify(sources,null,4))
                const row = [
                  record.ocid,
                  record.compiledRelease.contracts[c].title.toString().replace(/"/g, '\''),
                  suppliersNames, // .suppliers.name
                  buyerParty[0].name.replace(/"/g, '\''),
                  buyerParty[0].memberOf[0].name.replace(/"/g, '\''),
                  record.compiledRelease.total_amount,
                  record.compiledRelease.tender.procurementMethod,
                  record.compiledRelease.contracts[c].period.startDate,
                  record.compiledRelease.contracts[c].period.endDate,
                  record.compiledRelease.contracts[c].value.amount,
                  record.compiledRelease.contracts[c].value.currency,
                  sources,
                ];

                csv.push(`"${row.join('","')}"`);
              }
              catch (e) {
                console.error("error",e);
                console.log(record);
              }
            }
          }
        }
        break;
      }
      case 'persons': {
        const row = [item.id, item.name, item.contract_amount.supplier, item.contract_count.supplier];

        csv.push(`"${row.join('","')}"`);
        break;
      }
      case 'companies': {
        const row = [item.id, item.name, item.classification, item.subclassification, item.contract_amount.supplier, item.contract_count.supplier, item.contract_amount.buyer, item.contract_count.buyer];

        csv.push(`"${row.join('","')}"`);
        break;
      }
      case 'institutions': {
        // console.log(item);
        const row = [item.id, item.name, item.classification, item.subclassification, item.contract_amount.supplier, item.contract_count.supplier, item.contract_amount.buyer, item.contract_count.buyer];

        csv.push(`"${row.join('","')}"`);
        break;
      }
      default: {
        csv.push('CSV is not supported for this collection.');
        break;
      }
      }

    }
  }
  return csv.join('\n');
}


router.get('/:collection', async(req, res) => {
  // console.log("get");
  const limit = 1000;
  const question = (req.originalUrl.indexOf('?') === -1 ? '?' : '');
  const collection = req.params.collection;
  const fields = {
    contracts: "&fields=ocid,compiledRelease.buyer.id,compiledRelease.buyer.name,compiledRelease.contracts.title,compiledRelease.contracts.awardID,compiledRelease.awards.suppliers.name,compiledRelease.awards.id,compiledRelease.parties,compiledRelease.total_amount,compiledRelease.tender.procurementMethod,compiledRelease.contracts.period.startDate,compiledRelease.contracts.period.endDate,compiledRelease.contracts.value,compiledRelease.source"
  }
  const params = `${fields[collection]}&limit=${limit}`;
  const url = `http://${req.headers.host + req.originalUrl.replace('csv/', '')}${question}${params}`;
  const debug = req.query.debug;
  // console.log(url);

  request(url, (req2, res2, response) => {
    if (debug) {
      console.log(response);
    }
    const csv = api2csv(JSON.parse(response), collection, debug);

    res.set('Content-Type', 'text/plain');
    res.send(csv);
  });
});

module.exports = router;
