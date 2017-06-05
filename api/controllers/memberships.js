const db = require('../db');
const memberships = db.get('memberships', { castIds: false });
const omit = require('lodash/omit');
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;

const JOINS = [
  {
    $lookup: {
      from: 'persons',
      localField: 'person_id',
      foreignField: 'simple',
      as: 'person',
    },
  },
  {
    $lookup: {
      from: 'organizations',
      localField: 'sob_org',
      foreignField: 'simple',
      as: 'memberships',
    },
  },
];

function mapData(o) {
  const object = omit(o, ['user_id', 'sob_org']);

  object.org_id = o.sob_org;

  return omitEmpty(object);
}

function allMemberships(req, res) {
  const query = getQuery(req);

  res.charSet('utf-8');
  allDocuments(query, memberships, JOINS)
  .then(array => {
    const data = array[1].map(o => (mapData(o)));
    const size = array[1].length;

    if (query.embed) {
      // data = mapData(data);
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

function singleMembership(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  res.charSet('utf-8');
  memberships.aggregate(pipeline).then(docs => {
    res.json({
      status: 'success',
      data: docs,
    });
  });
}

module.exports = {
  allMemberships,
  singleMembership,
};
