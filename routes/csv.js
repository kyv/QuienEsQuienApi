const express = require('express');
const routerLib = express.Router;
const router = routerLib();
const request = require('request');
const pickBy = require('lodash/pickBy');
const values = require('lodash/values');

function api2csv(apiResponse, collection) {
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
  // console.log(apiResponse);
  for (const r in apiResponse.data) {
    if (Object.prototype.hasOwnProperty.call(apiResponse.data, r)) {
      const item = apiResponse.data[r];

      switch (collection) {
      case 'contracts': {
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
  const params = `&fields=records.ocid,records.compiledRelease.buyer.id,records.compiledRelease.buyer.name,records.compiledRelease.contracts.title,records.compiledRelease.contracts.awardID,records.compiledRelease.awards.suppliers.name,,records.compiledRelease.awards.id,records.compiledRelease.parties,records.compiledRelease.total_amount,records.compiledRelease.tender.procurementMethod,records.compiledRelease.contracts.period.startDate,records.compiledRelease.contracts.period.endDate,records.compiledRelease.contracts.value,records.compiledRelease.source&limit=${limit}`;
  const question = (req.originalUrl.indexOf('?') === -1 ? '?' : '');
  const url = `http://${req.headers.host + req.originalUrl.replace('csv/', '')}${question}${params}`;
  const collection = req.params.collection;
  // console.log(url);

  request(url, (req2, res2, response) => {
    // console.log(response);
    const csv = api2csv(JSON.parse(response), collection);

    res.set('Content-Type', 'text/plain');
    res.send(csv);
  });
});

module.exports = router;
