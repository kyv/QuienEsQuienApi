const db = require('../db');
const collection = db.get('persons', { castIds: false });
const omit = require('lodash/omit');
const personMemberMap = require('./lib').personMemberMap;
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
      foreignField: 'suppliers_person',
      as: 'suppliesContracts',
    },
  },
  {
    $lookup: {
      from: 'memberships',
      localField: 'simple',
      foreignField: 'person_id',
      as: 'memberships',
    },
  },
];

function personDataMap(o) {
  const object = o;
  const memberships = o.memberships.map(m => (personMemberMap(m)));
  const board = memberships.filter(b => (b.department === 'board'));
  const shares = memberships.filter(b => (b.role === 'shareholder'));

  object.board = board;
  object.shares = shares;
  return omitEmpty(omit(object, [
    'memberships',
    'user_id',
    'contracts._id',
    'contracts.user_id',
    'memberships._id',
    'memberships.user_id',
    'memberships.person',
    'memberships.person_id',
  ]));
}

function allPersons(req, res) {
  const query = getQuery(req);
  const offset = query.options.skip || 0;

  allDocuments(query, collection, JOINS)
    .then(array => (dataReturn(res, array, offset, query.embed, personDataMap)));
}

function allPersonsPost(req, res) {
  const query = req.body.query;
  const project = req.body.project;
  const offset = project && project.skip || 0;
  const resultsP = collection.find(query);
  const countP = collection.count(query);

  return Promise.all([countP, resultsP])
    .then(array => (dataReturn(res, array, offset, query.embed, personDataMap)));
}

function distinctPerson(req, res) {
  getDistinct(req, res, collection);
}

function singlePerson(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  collection.aggregate(pipeline)
    .then(docs => (dataReturn(res, [1, docs], 0, true, personDataMap)));
}

module.exports = {
  allPersons,
  singlePerson,
  allPersonsPost,
  distinctPerson,
};
