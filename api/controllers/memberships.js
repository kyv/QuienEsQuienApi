const db = require('../db');
const collection = db.get('memberships', { castIds: false });
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
  const offset = query.options.skip || 0;

  res.charSet('utf-8');
  allDocuments(query, collection, JOINS)
  .then(array => (dataReturn(res, array, offset, query.embed, mapData)));
}

function allMembershipsPost(req, res) {
  const query = req.body.query;
  const project = req.body.project;
  const offset = project && project.skip || 0;
  const resultsP = collection.find(query);
  const countP = collection.count(query);

  return Promise.all([countP, resultsP])
  .then(array => (dataReturn(res, array, offset, query.embed, mapData)));
}

function distinctMembership(req, res) {
  getDistinct(req, res, collection);
}

function singleMembership(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  res.charSet('utf-8');
  collection.aggregate(pipeline)
  .then(docs => (dataReturn(res, [1, docs], 0, true, mapData)));
}

module.exports = {
  allMemberships,
  singleMembership,
  allMembershipsPost,
  distinctMembership,
};
