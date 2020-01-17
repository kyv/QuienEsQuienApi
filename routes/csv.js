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
      'QQW Link'
    ],
    persons: ['id', 'name', 'contract_amount_supplier', 'contract_count_supplier', 'contract_amount_buyer', 'contract_count_buyer'],
    mujeres: ['name', 'role', 'company', 'country', 'gender', 'source'],
    institutions: ['id', 'name', 'classification', 'subclassification', 'contract_amount_supplier', 'contract_count_supplier', 'contract_amount_buyer', 'contract_count_buyer'],
    companies: ['id', 'name', 'classification', 'subclassification', 'contract_amount_supplier', 'contract_count_supplier', 'contract_amount_buyer', 'contract_count_buyer'],
  };

  csv.push(headers[collection]);

  if (debug) {
    // console.log("api2csv",apiResponse);
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
                const awardE = pickBy(record.compiledRelease.awards, i => i.id === record.compiledRelease.contracts[c].awardID);
                const award = values(awardE)[0];
                // console.log("award",JSON.stringify(award,null,4))
                const suppliersNames = award.suppliers.map(s => { if (s.name.toString()) { return s.name.replace(/"/g, '\'')}}).join(";");
                const sources = (award.documents) ? award.documents.map(s => s.url.replace(/ /g,"%20")).join(" ") : "";

                const row = [
                  record.ocid,
                  record.compiledRelease.contracts[c].title.toString().replace(/"/g, '\''),
                  suppliersNames, // .suppliers.name
                  buyerParty[0].name.replace(/"/g, '\''),
                  (buyerParty[0].memberOf) ? buyerParty[0].memberOf[0].name.replace(/"/g, '\'') : "",
                  record.compiledRelease.total_amount,
                  record.compiledRelease.tender.procurementMethod,
                  (record.compiledRelease.contracts[c].period) ? record.compiledRelease.contracts[c].period.startDate : "",
                  (record.compiledRelease.contracts[c].period) ? record.compiledRelease.contracts[c].period.endDate : "",
                  record.compiledRelease.contracts[c].value.amount,
                  record.compiledRelease.contracts[c].value.currency,
                  sources,
                  "https://www.quienesquien.wiki/contratos/"+encodeURIComponent(record.ocid)
                ];

                csv.push(`"${row.join('","')}"`);
              }
              catch (e) {
                console.error("error",e);
                // console.log(record);
              }
            }
          }
        }
        break;
      }
      case 'persons': {
        const row = [item.compiledRelease.id, item.compiledRelease.name];
        if (item.compiledRelease.contract_amount) {
          row.push(item.compiledRelease.contract_amount.supplier)
          row.push(item.compiledRelease.contract_amount.buyer)
        }
        else { row.push("");row.push(""); }
        if (item.compiledRelease.contract_count) {
          row.push(item.compiledRelease.contract_count.supplier)
          row.push(item.compiledRelease.contract_count.buyer)
        }
        else { row.push("");row.push(""); }

        csv.push(`"${row.join('","')}"`);
        break;
      }
      case 'mujeres': {
        if (item.memberships) {
          const memberships = [...item.memberships.parent, ...item.memberships.child];

          for (m in memberships) {
            let membership = memberships[m];
            // console.log("a",item.id,membership);
            const row = [item.compiledRelease.name];
            if (membership.compiledRelease) {

              if (membership.compiledRelease.role) {
                row.push(membership.compiledRelease.role);
              }
              else { row.push(""); }

              if (membership.compiledRelease.organization_name || membership.compiledRelease.parent_name) {
                row.push(membership.compiledRelease.organization_name || membership.compiledRelease.parent_name);
              }
              else { row.push(""); }


              if (item.compiledRelease.area) {
                row.push(item.compiledRelease.area.name);
              }
              else { row.push(""); }

              if (item.compiledRelease.gender) {
                row.push(item.compiledRelease.gender);
              }
              else { row.push(""); }

              if (item.compiledRelease.source) {
                row.push(item.compiledRelease.source.map(s => s.id).join(" "));
              }
              else { row.push(""); }

              csv.push(`"${row.join('","')}"`);
            }
          }
        }
        break;
      }
      case 'companies': {
        const row = [item.compiledRelease.id, item.compiledRelease.name, item.compiledRelease.classification, item.compiledRelease.subclassification];
        if (item.compiledRelease.contract_amount) {
          row.push(item.compiledRelease.contract_amount.supplier)
          row.push(item.compiledRelease.contract_amount.buyer)
        }
        if (item.compiledRelease.contract_count) {
          row.push(item.compiledRelease.contract_count.supplier)
          row.push(item.compiledRelease.contract_count.buyer)
        }

        csv.push(`"${row.join('","')}"`);
        break;
      }
      case 'institutions': {
        const row = [item.compiledRelease.id, item.compiledRelease.name, item.compiledRelease.classification, item.compiledRelease.subclassification];
        if (item.compiledRelease.contract_amount) {
          row.push(item.compiledRelease.contract_amount.supplier)
          row.push(item.compiledRelease.contract_amount.buyer)
        }
        if (item.compiledRelease.contract_count) {
          row.push(item.compiledRelease.contract_count.supplier)
          row.push(item.compiledRelease.contract_count.buyer)
        }

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
  const limit = req.query.limit || 1000;
  const collection = req.params.collection;
  const fields = {
    contracts: "&fields=ocid,compiledRelease.buyer.id,compiledRelease.buyer.name,compiledRelease.contracts.title,compiledRelease.contracts.awardID,compiledRelease.awards.documents.url,,compiledRelease.awards.suppliers.name,compiledRelease.awards.id,compiledRelease.parties,compiledRelease.total_amount,compiledRelease.tender.procurementMethod,compiledRelease.contracts.period.startDate,compiledRelease.contracts.period.endDate,compiledRelease.contracts.value,compiledRelease.source",
    persons: "&fields=compiledRelease.name,compiledRelease.id,compiledRelease.contract_count.buyer,compiledRelease.contract_amount.buyer,compiledRelease.contract_amount.supplier,compiledRelease.contract_count.supplier",
    mujeres: "&fields=compiledRelease.name,compiledRelease.memberships.parent.compiledRelease.role,compiledRelease.memberships.parent.compiledRelease.organization_name,compiledRelease.area.name",
    companies: "&fields=compiledRelease.name,compiledRelease.id,compiledRelease.classification,compiledRelease.subclassification,compiledRelease.contract_count.buyer,compiledRelease.contract_amount.buyer,compiledRelease.contract_amount.supplier,compiledRelease.contract_count.supplier",
    institutions: "&fields=compiledRelease.name,compiledRelease.id,compiledRelease.classification,compiledRelease.subclassification,compiledRelease.contract_count.buyer,compiledRelease.contract_amount.buyer,compiledRelease.contract_amount.supplier,compiledRelease.contract_count.supplier",
  }
  let params = `${fields[collection]}&limit=${limit}`;
  let newURL = req.originalUrl.replace('csv/', '').replace(/&limit=[0-9]*/,"");

  console.log("collection: ", collection);
  if (collection=="mujeres") {
    newURL = newURL.replace("mujeres","persons");
    params+="&embed=1";
  }

  //Add question mark before parameters if it's not there already
  if (newURL.indexOf("?") == -1) { newURL+="?" }

  //Remove download parameter before parameters if it's not there already
  if (newURL.indexOf("download=true") != -1) { newURL = newURL.replace("download=true","") }
  const url = `http://${req.headers.host + newURL}${params}`;
  const debug = req.query.debug;
  const download = req.query.download;
  console.log("originalUrl:", req.originalUrl);
  console.log("URL:", url);

  request(url, (req2, res2, response) => {
    if (debug) {
      // console.log("response status",response);
    }
    try {
      const responseJson = JSON.parse(response);
      if (responseJson.status == "success") {
        const csv = api2csv(responseJson, collection, debug);

        if (req.query.download == "true") {
          res.set('Content-Type', 'text/csv');
          res.set('Content-Disposition', "attachment");
        }
        else {
          res.set('Content-Type', 'text/plain');
        }
        res.send(csv);
      }
      else {
        throw(response);
      }
    }
    catch(e) {
      console.error("CSV Error",e);
      res.set('Content-Type', 'text/plain');
      res.send("Error. Nos vamos a recuperar de esta.\n\n Por favor intenta de nuevo.\n\n Si el problema persiste contáctanos.\n\n www.quienesquien.wiki");
    }
  });
});

module.exports = router;
