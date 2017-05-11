const db = require('../db');
const contracts = db.get('contracts', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const q2m = require('query-to-mongo');
const qs = require('qs');
const omit = require('lodash/omit');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const omitEmpty = require('./lib').omitEmpty;
const simpleName = require('./lib').simpleName;


function contractMapData(object) {
  const data = omit(object, ['suppliersOrg', 'suppliersPerson', 'dependencyOrg']);

  data.dependency = object.dependencyOrg;
  data.suppliers_org = object.suppliersOrg;
  data.suppliers_person = object.suppliersPerson;
  return omitEmpty(data);
}

function queryToPipeline(query) {
  const pipeline = [
    { $match: query.criteria },
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
  return pipeline;
}

function allContracts(req, res, next) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const mapped = mapValues(params, p => (p.value));
  const string = qs.stringify(mapped);
  const query = q2m(string);
  const pipeline = queryToPipeline(query);

  contracts.aggregate(pipeline).then(docs => {
    const PP = docs.map(o => {
      const simple = simpleName(o.dependency);

      return new Promise((resolve, reject) => {
        organizations.find({ simple }, '-user_id').then(c => {
          o.dependencyOrg = c;
          resolve(o);
        });
      });
    });

    Promise.all(PP).then(values => {
      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: values.map(o => contractMapData(o)),
        size: values.length,
      });
    });
  });
}

function singleContract(req, res) {
  const id = req.swagger.params._id.value;

  contracts.aggregate([
    { $match: { _id: id } },
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
    const PP = docs.map(o => {
      const simple = simpleName(o.dependency);

      return new Promise((resolve, reject) => {
        organizations.find({ simple }, '-user_id').then(c => {
          o.dependencyOrg = c;
          resolve(o);
        });
      });
    });

    Promise.all(PP).then(values => {
      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: values.map(o => contractMapData(o)),
        size: values.length,
      });
    });
  });
}

module.exports = {
  allContracts,
  singleContract,
};
