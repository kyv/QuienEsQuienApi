const db = require('../db');
const organizations = db.get('organizations', { castIds: false });
const q2m = require('query-to-mongo');
const qs = require('qs');
const omit = require('lodash/omit');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const omitEmpty = require('./lib').omitEmpty;

function orgDataMap(o) {
  const object = omit(o, ['memberships_sob', 'shares']);
  const sob = o.memberships_sob.map(b => (omit(b, ['_id', 'user_id', 'sob_org'])));

  object.shares = o.shares
    .map(b => {
      b.org_id = b.sob_org;
      return omit(b, ['_id', 'user_id', 'sob_org', 'org', 'role']);
    });

  object.board = sob
    .filter(b => (b.department === 'board'))
    .map(b => (omit(b, ['department'])));

  object.shareholders = sob.filter(b => (b.role === 'shareholder'))
    .map(b => (omit(b, 'role')));

  object.memberships = sob.filter(b => {
    return (b.role !== 'shareholder' && b.department !== 'board');
  });

  return omitEmpty(object);
}

function queryToPipeline(query) {
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
        as: 'shares',
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

  // pipeline.push({ $project: projection });
  // FIXME  cannot exclude fields until mongo 3.4
  return pipeline;
}

function allOrganizations(req, res, next) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const mapped = mapValues(params, p => (p.value));
  const string = qs.stringify(mapped);
  const query = q2m(string);
  const pipeline = queryToPipeline(query);

  organizations.aggregate(pipeline).then(docs => {
      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: docs.map(o => (orgDataMap(o))),
        size: docs.length,
      });
    });

    // FIXME disalble linking dependency util we can get it in aggretation
    // const PP = docs.map(o => {
    //   const regex = new RegExp(o.names.join('|'), 'i');

    //   return new Promise((resolve, reject) => {
    //     contracts.find({ dependency: regex }, '-user_id').then(c => {
    //       o.contracts = c;
    //       resolve(o);
    //     });
    //   });
    // });

    // Promise.all(PP).then(values => {
    //   res.charSet('utf-8');
    //   res.json({
    //     status: 'success',
    //     data: orgDataMap(values),
    //     size: values.length,
    //   });
    // });
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
        as: 'shares',
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
  ]).then(docs => {
    res.charSet('utf-8');
    res.json({
      status: 'success',
      data: docs.map(o => (orgDataMap(o))),
      size: docs.length,
    });
  });
}

module.exports = {
  allOrganizations,
  singleOrganization,
};
