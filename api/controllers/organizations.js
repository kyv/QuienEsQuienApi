const db = require('../db');
const organizations = db.get('organizations', { castIds: false });
const omit = require('lodash/omit');
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const arrayResultsOptions = require('./lib').arrayResultsOptions;
const getQuery = require('./lib').getQuery;

const JOINS = [
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

function allOrganizations(req, res, next) {
  const query = getQuery(req);
  const countP = organizations.count(query.criteria);

  if (query.embed) {
    const p = queryToPipeline(query, JOINS);
    const pipeline = arrayResultsOptions(query, p);
    const resultsP = organizations.aggregate(pipeline);

    Promise.all([countP, resultsP])
    .then(array => {
      const size = array[1].length;

      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: array[1].map(o => (orgDataMap(o))),
        size,
        offset: query.options.skip,
        pages: Math.ceil((array[0] / size)),
      });
    });
  } else {
    const resultsP = organizations.find(query.criteria, query.options);
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

function singleOrganization(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  organizations.aggregate(pipeline).then(docs => {
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
