const db = require('../db');
const collection = db.get('organizations', { castIds: false });
const omit = require('lodash/omit');
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;

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

  res.charSet('utf-8');
  allDocuments(query, collection, JOINS)
  .then(array => {
    let data = array[1];
    const size = array[1].length;

    if (query.embed) {
      data = array[1].map(o => (orgDataMap(o)));
    }

    res.json({
      status: 'success',
      data,
      size,
      offset: query.options.skip,
      pages: Math.ceil((array[0] / size)),
    });
  });
}

function allOrganizationsPost(req, res) {
  const query = req.body.query;
  const project = req.body.project;
  const resultsP = collection.find(query);
  const countP = collection.count(query);

  res.charSet('utf-8');
  return Promise.all([countP, resultsP])
  .then(array => {
    const data = array[1];
    const size = data.length;

    res.json({
      status: 'success',
      data,
      size,
      offset: project && project.limit || 0,
      pages: Math.ceil((array[0] / size)),
    });
  });
}

function singleOrganization(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  collection.aggregate(pipeline).then(docs => {
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
  allOrganizationsPost,
};
