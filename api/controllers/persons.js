const db = require('../db');
const persons = db.get('persons', { castIds: false });
const omit = require('lodash/omit');
const personMemberMap = require('./lib').personMemberMap;
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;

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
  allDocuments(query, persons, JOINS)
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

function singlePerson(req, res) {
  const query = getQuery(req);
  const pipeline = queryToPipeline(query, JOINS);

  res.charSet('utf-8');
  persons.aggregate(pipeline).then(docs => {
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
