const db = require('../db');
const contracts = db.get('contracts', { castIds: false });
const omit = require('lodash/omit');
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const arrayResultsOptions = require('./lib').arrayResultsOptions;
const getQuery = require('./lib').getQuery;

const JOINS = [
  { $unwind: {
    path: '$suppliers_person',
    preserveNullAndEmptyArrays: true,
  },
  },
  { $unwind: {
    path: '$suppliers_org',
    preserveNullAndEmptyArrays: true,
  },
  },
  {
    $lookup: {
      from: 'organizations',
      localField: 'suppliers_org',
      foreignField: 'simple',
      as: 'suppliersOrg',
    },
  },
  {
    $lookup: {
      from: 'persons',
      localField: 'suppliers_person',
      foreignField: 'simple',
      as: 'suppliersPerson',
    },
  },
];

function contractMapData(object) {
  const data = omit(object, [
    'user_id',
    'suppliersOrg',
    'suppliersPerson',
    'dependencyOrg',
    'suppliers_org',
    'suppliers_person',
  ]);

  if (object.suppliersOrg[0] && object.suppliersOrg[0].simple) {
    data.suppliers_org = object.suppliersOrg;
  }
  if (object.suppliersPerson[0] && object.suppliersPerson[0].simple) {
    data.suppliers_person = object.suppliersPerson;
  }
  return omitEmpty(data);
}

function allContracts(req, res, next) {
  const query = getQuery(req);
  const countP = contracts.count(query.criteria);

  if (query.embed) {
    const p = queryToPipeline(query, JOINS);
    const pipeline = arrayResultsOptions(query, p);
    const resultsP = contracts.aggregate(pipeline);

    Promise.all([countP, resultsP])
    .then(array => {
      const size = array[1].length;

      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: array[1].map(o => contractMapData(o)),
        size,
        offset: query.options.skip,
        pages: Math.ceil((array[0] / size)),
      });
    });
  } else {
    const resultsP = contracts.find(query.criteria, query.options);

    Promise.all([countP, resultsP])
    .then(array => {
      const size = array[1].length;

      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: array[1],
        size,
        offset: query.options.skip,
        pages: Math.ceil((array[0] / size)),
      });
    });
  }
}

function singleContract(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  contracts.aggregate(pipeline).then(docs => {
    res.charSet('utf-8');
    res.json({
      status: 'success',
      data: docs.map(o => contractMapData(o)),
      size: docs.length,
    });
  });
}

module.exports = {
  allContracts,
  singleContract,
};
