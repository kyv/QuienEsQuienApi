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
  uri: '',
  version: '1.1',
  extensions: [
    'https://raw.githubusercontent.com/transpresupuestaria/ocds_contract_data_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting-extensions/ocds_partyDetails_scale_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting/ocds_budget_breakdown_extension/master/extension.json',
    'https://raw.githubusercontent.com/open-contracting-extensions/ocds_memberOf_extension/master/extension.json',
    'https://raw.githubusercontent.com/ProjectPODER/ocds_compranet_extension/master/extension.json',

  ],
  publisher: {
    name: 'QuienEsQuien.wiki',
    uri: 'https://quienesquien.wiki/',
  },
  license: 'https://creativecommons.org/licenses/by-sa/4.0/deed.es',
  publicationPolicy: 'https://quienesquien.wiki/about',
  publishedDate: '',
  records: [],
};

const flagJoins = [
  {
    $lookup: {
      from: 'contract_flags',
      localField: 'ocid',
      foreignField: 'ocid',
      as: 'flags',
    },
  }
];

function addRecordPackage(object, debug) {
  if (debug) {
    console.log("addRecordPackage", object);
  }
  if (typeof object[1][0] == "object") {
    const recordPackage = clone(recordPackageBase);

    recordPackage.records = object[1];
    recordPackage.uri = `https://api.beta.quienesquien.wiki/v2/${object[1][0].ocid}`;
    recordPackage.publishedDate = object[1][0].compiledRelease.date;
    object[1] = [recordPackage];
    object[2] = object[1][0].records.length;
  }
  return object;
}

function contractMapData(object) {

  return object;
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

async function allContracts(req, res) {
  const debug = req.query.debug;
  const query = getQuery(req,debug);
  const offset = query.options.skip || 0;
  // console.log("allContracts debug",debug);

  let joins = [];


  if (query.criteria['compiledRelease.awards.suppliers.id']) {
    query.embed = true;
    query.criteria['compiledRelease.awards.suppliers.id'] = { $in: await db.get('organizations').distinct('id',
      {
        id: query.criteria['compiledRelease.awards.suppliers.id'],
      }),
    };
  }

  if (query.criteria['compiledRelease.parties.memberOf.name']) {
    query.embed = true;
    query.criteria['compiledRelease.parties.memberOf.id'] = { $in: await db.get('organizations').distinct('id',
      {
        name: query.criteria['compiledRelease.parties.memberOf.name'],
        classification: 'institution',
      }),
    };
    delete query.criteria['compiledRelease.parties.memberOf.name'];
  }

  if (query.criteria['compiledRelease.awards.suppliers.name']) {
    // console.log('allContracts','compiledRelease.awards.suppliers.name',query.criteria['compiledRelease.awards.suppliers.name']);
    const sq = await db.get('organizations').distinct('id', { name: query.criteria['compiledRelease.awards.suppliers.name'] });
    const pq = await db.get('persons').distinct('id', { name: query.criteria['compiledRelease.awards.suppliers.name'] });

    query.embed = true;
    query.criteria['compiledRelease.awards.suppliers.id'] = { $in: [...sq, ...pq]  };
    if (debug) {
      console.log("Filtro por compiledRelease.awards.suppliers.name, ids:",query.criteria['compiledRelease.awards.suppliers.id']);
    }
    delete query.criteria['compiledRelease.awards.suppliers.name'];
  }


  if (query.options.limit == 1) {
    joins = flagJoins;
  }


  // if query.  compiledRelease.awards.suppliers.name
   // query.embed = true

  // db.records.aggregate({$match:{ "compiledRelease.awards.suppliers.id": { $in: db.organizations.distinct("id",{name: /test/i}) } }})


  if (debug) {
    console.log("DEBUG allContracts query",JSON.stringify(query,null,4));
  }

  allDocuments(query, collection, joins, debug)
    .then(array => (addRecordPackage(array, debug)))
    .catch(err => {
      console.error('allContracts query error', err);
      if (err) {
        return err;
      }
      return false;
    })
    .then(array => {
      return dataReturn(res, array, offset, query.options.limit, query.embed, contractMapData, debug)
    } )
    .catch(err => {
      console.error("allContracts return error",err);
      res.json({"error": "error"})
    });

}

function distinctContract(req, res) {
  getDistinct(req, res, collection);
}

function singleContract(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, flagJoins);

  // console.log("singleContract",pipeline);

  collection.aggregate(pipeline)
    .then(docs => (dataReturn(res, [1, docs], 0, query.options.limit, true, contractMapData)));

}

module.exports = {
  allContracts,
  singleContract,
  distinctContract,
};
