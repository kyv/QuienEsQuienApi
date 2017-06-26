const db = require('../db');
const collection = db.get('persons', { castIds: false });
const omit = require('lodash/omit');
const personMemberMap = require('./lib').personMemberMap;
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;

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

function personDataMap(array) {
  return array.map(o => {
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
  });
}

function allPersons(req, res) {
  const query = getQuery(req);

  res.charSet('utf-8');
  allDocuments(query, collection, JOINS)
    .then(array => {
      let data = array[1];
      const size = array[1].length;

      if (query.embed) {
        data = personDataMap(array[1]);
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

function allPersonsPost(req, res) {
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

function distinctPerson(req, res) {
  getDistinct(req, res, collection);
}

function singlePerson(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  res.charSet('utf-8');
  collection.aggregate(pipeline).then(docs => {
    res.json({
      status: 'success',
      data: personDataMap(docs),
    });
  });
}

module.exports = {
  allPersons,
  singlePerson,
  allPersonsPost,
  distinctPerson,
};
