const db = require('../db');
const contracts = db.get('contracts', { castIds: false });
const q2m = require('query-to-mongo');
const qs = require('qs');
const omit = require('lodash/omit');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const omitEmpty = require('./lib').omitEmpty;

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

function queryToPipeline(query) {
  const pipeline = [
    { $match: query.criteria },
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

  if (query.options.skip) {
    pipeline.push({ $skip: query.options.skip });
  }
  if (query.options.limit) {
    pipeline.push({ $limit: query.options.limit });
  }

  if (query.options.sort) {
    pipeline.push({ $sort: query.options.sort });
  }

  // pipeline.push({ $project: projection });
  // FIXME add in mongodb >= 3.4
  return pipeline;
}

function allContracts(req, res, next) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const mapped = mapValues(params, p => (p.value));
  const string = qs.stringify(mapped);
  const query = q2m(string);
  const pipeline = queryToPipeline(query);

  contracts.aggregate(pipeline).then(docs => {
    res.charSet('utf-8');
    res.header('content-type', 'application/json');
    return res.end({
      status: 'success',
      data: docs.map(o => contractMapData(o)),
      size: docs.length,
    });
    // res.json({
    //   status: 'success',
    //   data: docs.map(o => contractMapData(o)),
    //   size: docs.length,
    // });
  });
}

function singleContract(req, res) {
  const id = req.swagger.params._id.value;

  contracts.aggregate([
    { $match: { _id: id } },
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
  ]).then(docs => {
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
