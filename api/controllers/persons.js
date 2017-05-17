const db = require('../db');
const persons = db.get('persons', { castIds: false });
const q2m = require('query-to-mongo');
const qs = require('qs');
const omit = require('lodash/omit');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const personMemberMap = require('./lib').personMemberMap;
const omitEmpty = require('./lib').omitEmpty;

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

const defaultProjection = {
  user_id: 0,
  'suppliesContracts.user_id': 0,
  'memberships._id': 0,
  'memberships.user_id': 0,
  'memberships.person': 0,
  'memberships.person_id': 0,
};

function queryToPipeline(query) {
  let projection = defaultProjection;

  if (query.options.fields) {
    projection = query.options.fields;
  }
  const pipeline = [
    { $match: query.criteria },
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

  if (query.options.skip) {
    pipeline.push({ $skip: query.options.skip });
  }
  if (query.options.limit) {
    pipeline.push({ $limit: query.options.limit });
  }

  if (query.options.sort) {
    pipeline.push({ $sort: query.options.sort });
  }

  return pipeline;
}

function allPersons(req, res, next) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const mapped = mapValues(params, p => (p.value));
  const string = qs.stringify(mapped);
  const query = q2m(string);
  const pipeline = queryToPipeline(query);

  persons.aggregate(pipeline).then(docs => {
    res.charSet('utf-8');
    res.json({
      status: 'success',
      data: personDataMap(docs),
      size: docs.length,
    });
  });
}

function singlePerson(req, res) {
  const id = req.swagger.params._id.value;

  persons.aggregate([
    { $match: { _id: id } },
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
  ]).then(docs => {
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
