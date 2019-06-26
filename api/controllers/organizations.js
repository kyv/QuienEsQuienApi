const db = require('../db');
const collection = db.get('organizations', { castIds: false });
const omit = require('lodash/omit');
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;

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

  object.memberships = sob.filter(b => (b.role !== 'shareholder' && b.department !== 'board'));

  return omitEmpty(object);
}

function allOrganizations(req, res) {
  const query = getQuery(req);
  const offset = query.options.skip || 0;

  allDocuments(query, collection, JOINS)
    .then(array => (dataReturn(res, array, offset, query.embed, orgDataMap)));
}

function distinctOrganization(req, res) {
  getDistinct(req, res, collection);
}


function singleOrganization(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  collection.aggregate(pipeline)
    .then(docs => (dataReturn(res, [1, docs], 0, true, orgDataMap)));
}

module.exports = {
  allOrganizations,
  singleOrganization,
  distinctOrganization,
};
