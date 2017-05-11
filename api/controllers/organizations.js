const db = require('../db');
const organizations = db.get('organizations', { castIds: false });
const contracts = db.get('contracts', { castIds: false });
const q2m = require('query-to-mongo');
const qs = require('qs');
const omit = require('lodash/omit');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const omitEmpty = require('./lib').omitEmpty;

function orgDataMap(array) {
  return array.map(o => {
    const regex = new RegExp(o.simple, 'i');
    const contractsP = contracts.find({ dependency: regex });

    const object = o;
    object.shares = o.memberships_org.filter(b => (b.role === 'shareholder'));
    object.board = o.memberships_sob.filter(b => (b.department === 'board'));
    object.shareholders = o.memberships_sob.filter(b => (b.role === 'shareholder'));
    object.memberships = o.memberships_sob.filter(b => {
      return (b.role !== 'shareholder' && b.department !== 'board');
    });

    return omitEmpty(omit(object, ['memberships_org', 'memberships_sob']));
  });
}

const defaultProjection = {
  user_id: 0,
  'suppliesContracts.user_id': 0,
  'memberships_sob._id': 0,
  'memberships_org._id': 0,
  'memberships_sob.user_id': 0,
  'memberships_sob.sob_org': 0,
  'memberships_org.user_id': 0,
};

function queryToPipeline(query) {
  let projection = defaultProjection;

  if (query.options.fields) {
    projection = query.options.fields;
  }
  const pipeline = [
    { $match: query.criteria },
    {
      $lookup: {
        from: 'contracts',
        localField: 'simple',
        foreignField: 'suppliers_org',
        as: 'suppliesContracts',
      },
    },
    {
      $lookup: {
        from: 'memberships',
        localField: 'simple',
        foreignField: 'org_id',
        as: 'memberships_org',
      },
    },
    {
      $lookup: {
        from: 'memberships',
        localField: 'simple',
        foreignField: 'sob_org',
        as: 'memberships_sob',
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

  pipeline.push({ $project: projection });
  return pipeline;
}

function allOrganizations(req, res, next) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const mapped = mapValues(params, p => (p.value));
  const string = qs.stringify(mapped);
  const query = q2m(string);
  const pipeline = queryToPipeline(query);

  organizations.aggregate(pipeline).then(docs => {
    const data = orgDataMap(docs);

    const PP = data.map(o => {
      const regex = new RegExp(o.names.join('|'), 'i');

      return new Promise((resolve, reject) => {
        contracts.find({ dependency: regex }, '-user_id').then(c => {
          o.contracts = c;
          resolve(o);
        });
      });
    });

    Promise.all(PP).then(values => {
      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: values,
        size: values.length,
      });
    });

  });
}

function singleOrganization(req, res) {
  const id = req.swagger.params._id.value;

  organizations.aggregate([
    { $match: { _id: id } },
    {
      $lookup: {
        from: 'contracts',
        localField: 'simple',
        foreignField: 'suppliers_org',
        as: 'suppliesContracts',
      },
    },
    {
      $lookup: {
        from: 'memberships',
        localField: 'simple',
        foreignField: 'org_id',
        as: 'memberships_org',
      },
    },
    {
      $lookup: {
        from: 'memberships',
        localField: 'simple',
        foreignField: 'sob_org',
        as: 'memberships_sob',
      },
    },
    { $project: defaultProjection },
  ]).then(docs => {
    const data = orgDataMap(docs);

    const PP = data.map(o => {
      const regex = new RegExp(o.names.join('|'), 'i');

      return new Promise((resolve, reject) => {
        contracts.find({ dependency: regex }, '-user_id').then(c => {
          o.contracts = c;
          resolve(o);
        });
      });
    });

    Promise.all(PP).then(values => {
      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: values,
        size: values.length,
      });
    });
  });
}

module.exports = {
  allOrganizations,
  singleOrganization,
};
