const flow = require('lodash/fp/flow');
const omitBy = require('lodash/fp/omitBy');
const isArray = require('lodash/fp/isArray');
const isEmpty = require('lodash/fp/isEmpty');
const isDate = require('lodash/fp/isDate');
const isObject = require('lodash/fp/isObject');
const isString = require('lodash/fp/isString');
const isNil = require('lodash/fp/isNil');
const extend = require('lodash/extend');
const omit = require('lodash/omit');
const keys = require('lodash/keys');
const q2m = require('query-to-mongo');
const qs = require('qs');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const removeDiacritics = require('diacritics').remove;

function getQuery(req) {
  const params = pickBy(req.swagger.params, p => (p.value));

  // account for empty fields ($exists)
  const maybeEmpty = pickBy(req.swagger.params, p => (p.parameterObject.allowEmptyValue));
  const paramsEmpty = pickBy(req.query, (value, key) => {
    return (keys(maybeEmpty).indexOf(key) > -1);
  });

  // acount for dot notation
  const dotted = pickBy(req.query, (value, key) => {
    return (key.indexOf('.') > -1);
  });

  const mapped = mapValues(params, p => (p.value));

  extend(mapped, paramsEmpty, dotted);
  const string = qs.stringify(mapped);
  const query = q2m(string, { ignore: 'embed' });

  query.embed = mapped.embed;
  return query;
}

function queryToPipeline(query, JOINS) {
  const pipeline = [{ $match: query.criteria }];

  JOINS.forEach(o => pipeline.push(o));
  return pipeline;
}

function arrayResultsOptions(query, pipeline) {
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

function personMemberMap(doc) {
  const member = extend(doc, {
    org_id: doc.sob_org,
  });

  return omit(member, ['sob_org']);
}

function allDocuments(query, collection, JOINS) {
  const countP = collection.count(query.criteria);

  if (query.embed) {
    const p = queryToPipeline(query, JOINS);
    const pipeline = arrayResultsOptions(query, p);
    const resultsP = collection.aggregate(pipeline);

    return Promise.all([countP, resultsP]);
  }

  const resultsP = collection.find(query.criteria, query.options);

  return Promise.all([countP, resultsP]);
}

function omitEmpty(object) {
  return flow(
    omitBy(isNil),
    omitBy(v => (isArray(v) && isEmpty(v))),
    omitBy(v => (isString(v) && isEmpty(v))),
    omitBy(v => (!isDate(v) && isObject(v) && isEmpty(v)))
  )(object);
}

function simpleName(string) {
  return removeDiacritics(string)
    .replace(/[,.]/g, '') // remove commas and periods
    .toLowerCase();
}

module.exports = {
  personMemberMap,
  omitEmpty,
  simpleName,
  queryToPipeline,
  arrayResultsOptions,
  getQuery,
  allDocuments,
};
