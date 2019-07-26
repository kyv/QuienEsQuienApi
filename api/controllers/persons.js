const db = require('../db');
const collection = db.get('persons', { castIds: false });
// const omit = require('lodash/omit');
// const personMemberMap = require('./lib').personMemberMap;
// const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const addContracts = require('./lib').addContracts;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;

const JOINS = [
  // {
  //   $lookup: {
  //     from: 'contracts',
  //     localField: 'id',
  //     foreignField: 'records.compiledRelease.awards.supplier.id',
  //     as: 'contracts.supplier',
  //   },
  //   $lookup: {
  //     from: 'contracts',
  //     localField: 'id',
  //     foreignField: 'records.compiledRelease.buyer.id',
  //     as: 'contracts.buyer',
  //   },
  // },
  {
    $lookup: {
      from: 'memberships',
      localField: 'id',
      foreignField: 'person_id',
      as: 'memberships.child',
    },
  },
  {
    $lookup: {
      from: 'memberships',
      localField: 'id',
      foreignField: 'parent_id',
      as: 'memberships.parent',
    },
  },
];

function personDataMap(o) {
  // const object = o;
  // // console.log(o);
  // const memberships = o.memberships.map(m => (personMemberMap(m)));
  // const board = memberships.filter(b => (b.department === 'board'));
  // const shares = memberships.filter(b => (b.role === 'shareholder'));
  //
  // object.board = board;
  // object.shares = shares;
  // return omitEmpty(omit(object, [
  //   // 'memberships',
  //   'user_id',
  //   'contracts._id',
  //   'contracts.user_id',
  //   'memberships._id',
  //   'memberships.user_id',
  //   'memberships.person',
  //   'memberships.person_id',
  // ]));
  return o;
}

function allPersons(req, res) {
  const query = getQuery(req);
  const offset = query.options.skip || 0;

  // console.log("allPersons",query);
  // return {};

  query.embed = true; // Forzar que incluya los subobjetos de los JOINS

  allDocuments(query, collection, JOINS)
    .then(array => (addContracts(collection, array, db)))
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
  distinctPerson,
};
