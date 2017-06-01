const db = require('../db');
const persons = db.get('persons', { castIds: false });
const omit = require('lodash/omit');
const personMemberMap = require('./lib').personMemberMap;
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const arrayResultsOptions = require('./lib').arrayResultsOptions;
const getQuery = require('./lib').getQuery;

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

function allPersons(req, res, next) {
  const query = getQuery(req);
  const countP = persons.count(query.criteria);

  if (query.embed) {
    const p = queryToPipeline(query, JOINS);
    const pipeline = arrayResultsOptions(query, p);
    const resultsP = persons.aggregate(pipeline);

    Promise.all([countP, resultsP])
    .then(array => {
      const size = array[1].length;

      res.charSet('utf-8');
      res.json({
        status: 'success',
        data: personDataMap(array[1]),
        size,
        offset: query.options.skip,
        pages: Math.ceil((array[0] / size)),
      });
    });
  } else {
    const resultsP = persons.find(query.criteria, query.options);
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

function singlePerson(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  persons.aggregate(pipeline).then(docs => {
    res.charSet('utf-8');
    res.json({
      status: 'success',
      data: personDataMap(docs),
    });
  });
}

module.exports = {
  allPersons,
  singlePerson,
};
