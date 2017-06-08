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
const q2m = require('query-to-mongo');
const qs = require('qs');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const removeDiacritics = require('diacritics').remove;
const sanitize = require('mongo-sanitize');
const parser = require('mongo-parse');
const moment = require('moment');
// FIXME we should modify or replace `swagger_params_parser`
// fitting instead of reparsing params here

// https://www.npmjs.com/package/query-to-mongo#field-selection

function parseDates(string) {
  const object = new Date(string);
  const isValidDate = moment(object).isValid();

  if (isValidDate) {
    return object;
  }
  return string;
}

function getQuery(req) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const sane = sanitize(req.query);
  const mapped = mapValues(params, p => (p.value));

  extend(sane, mapped);
  const string = qs.stringify(sane);
  const query = q2m(string, { ignore: 'embed' });
  const parsed = parser.parse(query.criteria);

  query.criteria = parsed.mapValues((field, value) => (parseDates(value)));
  query.embed = (isString(sane.embed));
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
