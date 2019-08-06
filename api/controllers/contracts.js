const db = require('../db');
const collection = db.get('records', { castIds: false });
// const omit = require('lodash/omit');
const clone = require('lodash/clone');
// const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;
const recordPackageBase = {
  'uri': '',
  'version': '1.1',
  'extensions': [
    'https://raw.githubusercontent.com/transpresupuestaria/ocds_contract_data_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting-extensions/ocds_partyDetails_scale_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting/ocds_budget_breakdown_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting-extensions/ocds_memberOf_extension/master/extension.json',
    'https://raw.githubusercontent.com/ProjectPODER/ocds_compranet_extension/master/extension.json'

  ],
  'publisher': {
    'name': 'QuienEsQuien.wiki',
    'uri': 'https://quienesquien.wiki/'
  },
  'license': 'https://creativecommons.org/licenses/by-sa/4.0/deed.es',
  'publicationPolicy': 'https://quienesquien.wiki/about',
  'publishedDate': '',
  'records': [],
};

const JOINS = [
//   { $unwind: {
//     path: '$suppliers_person',
//     preserveNullAndEmptyArrays: true,
//   },
//   },
//   { $unwind: {
//     path: '$suppliers_org',
//     preserveNullAndEmptyArrays: true,
//   },
//   },
//   {
//     $lookup: {
//       from: 'organizations',
//       localField: 'suppliers_org',
//       foreignField: 'simple',
//       as: 'suppliersOrg',
//     },
//   },
//   {
//     $lookup: {
//       from: 'persons',
//       localField: 'suppliers_person',
//       foreignField: 'simple',
//       as: 'suppliersPerson',
//     },
//   },
];

function addRecordPackage(object) {
  if (object[1][0]) {
    const recordPackage = clone(recordPackageBase);

    recordPackage.records = object[1];
    recordPackage.uri = `https://api.beta.quienesquien.wiki/v2/${object[1][0].ocid}`;
    recordPackage.publishedDate = object[1][0].compiledRelease.date;
    object[1] = recordPackage;
  }
  return object;
}

function contractMapData(object) {

  return {};
  //
  // const data = omit(object, [
  //   'user_id',
  //   'suppliersOrg',
  //   'suppliersPerson',
  //   'dependencyOrg',
  //   'suppliers_org',
  //   'suppliers_person',
  // ]);
  //
  // if (object.suppliersOrg[0] && object.suppliersOrg[0].simple) {
  //   data.suppliers_org = object.suppliersOrg;
  // }
  // if (object.suppliersPerson[0] && object.suppliersPerson[0].simple) {
  //   data.suppliers_person = object.suppliersPerson;
  // }
  // return omitEmpty(data);
}

function allContracts(req, res) {
  const query = getQuery(req);
  const offset = query.options.skip || 0;

  console.log("allContracts",query);

  allDocuments(query, collection, JOINS)
    .then(addRecordPackage)
    .then(array => (dataReturn(res, array, offset, query.embed, contractMapData)))
    .catch(err => {
      console.error('allContracts', err);
      if (err) {
        return err;
      }
      return false;
    });
}

function distinctContract(req, res) {
  getDistinct(req, res, collection);
}

function singleContract(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  // console.log("singleContract",pipeline);

  collection.aggregate(pipeline)
    .then(docs => (dataReturn(res, [1, docs], 0, true, contractMapData)));

}

module.exports = {
  allContracts,
  singleContract,
  distinctContract,
};
