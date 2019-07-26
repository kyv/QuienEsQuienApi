const flow = require('lodash/fp/flow');
const omitBy = require('lodash/fp/omitBy');
const isArray = require('lodash/fp/isArray');
const isEmpty = require('lodash/fp/isEmpty');
const isDate = require('lodash/fp/isDate');
const isObject = require('lodash/fp/isObject');
const isString = require('lodash/fp/isString');
const clone = require('lodash/fp/clone');
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
  if (typeof string === 'number') {
    return string;
  }
  if (typeof string === 'object') {
    return string;
  }
  // console.log("parseDates",string);
  const object = new Date(string);
  const isValidDate = moment(object).isValid();

  if (isValidDate) {
    return object.toISOString();
  }
  return string;
}

function simpleName(string) {
  return removeDiacritics(string)
    .replace(/[,.]/g, '') // remove commas and periods
    .toLowerCase();
}

function getQuery(req) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const sane = sanitize(req.query);

  const mapped = mapValues(params, p => (p.value));

  extend(sane, mapped);

  // console.log("getQuery",sane);
  //
  // // Fix underscore to dot params
  // for (const paramName in sane) {
  //   if (Object.prototype.hasOwnProperty.call(sane, paramName) ) {
  //     // console.log('min', paramName, sane[paramName]);
  //     const dotParamName = paramName.replace(/_/g, '.');
  //
  //     sane[dotParamName] = sane[paramName];
  //     // sane[dotParamName].parameterObject.name=dotParamName;
  //     if (dotParamName !== paramName) {
  //       delete sane[paramName];
  //     }
  //   }
  // }

  const string = qs.stringify(sane);

  // console.log(string);
  const query = q2m(string, { ignore: 'embed' });
  // console.log("getQuery",query);

  // Fix array criteria
  for (const criteria in query.criteria) {
    if (criteria.indexOf('[') > -1) {
      const cleanCriteria = criteria.substr(0, criteria.indexOf('['));
      const obj = {};

      if (!query.criteria.$and) {
        query.criteria.$and = [];
      }
      obj[cleanCriteria] = query.criteria[criteria];
      query.criteria.$and.push(obj);
      // console.log("a2",query.criteria.$and);
      // Object.assign(query.criteria,and);
      delete query.criteria[criteria];
    }
  }

  // console.log("getQuery",JSON.stringify(query));

  const parsed = parser.parse(query.criteria);

  // console.log("getQuery parsed",JSON.stringify(parsed,null,4));

  query.criteria = parsed.mapValues((field, value) => (parseDates(value)));
  // console.log("getQuery criteria",query.criteria);
  query.embed = (isString(sane.embed));
  return query;
}

function getDistinct(req, res, collection) {
  const field = req.swagger.params.field.value;
  const sane = sanitize(req.query);
  const string = qs.stringify(sane);
  const query = q2m(string, { ignore: 'embed' });

  res.set('Content-Type', 'application/json; charset=utf-8');
  return collection.distinct(field, query.criteria)
    .then(data => {
      const size = data.length;

      res.json({
        status: 'success',
        data,
        size,
      });
    });
}

function queryToPipeline(query, JOINS) {
  JOINS.unshift({
    $match: query.criteria,
  });
  return JOINS;
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
    const p = queryToPipeline(query, clone(JOINS));
    const pipeline = arrayResultsOptions(query, p);
    const resultsP = collection.aggregate(pipeline);

    return Promise.all([countP, resultsP]);
  }
  const resultsP = collection.find(query.criteria, query.options).catch(err => {
    // console.error("allDocuments",err);
    if (err) {
      return 'error: {err}';
    }
    return err;
  });

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

function dataReturn(res, array, offset, embed, objectFormat) {
  let data = array[1];
  const size = array[1].length;

  if (embed) {
    data = array[1].map(o => (objectFormat(o)));
  }

  res.set('Content-Type', 'application/json; charset=utf-8');
  res.json({
    status: 'success',
    data,
    size,
    offset,
    pages: Math.ceil((array[0] / size)),
    count: array[0],
  });
}


async function getContracts(type, id, db) {
  const records = db.get('records', { castIds: false });
  const options = { limit: -3, sort: { 'records.compiledRelease.total_amount': -1 } };
  let filter = {};

  if (type === 'buyer') {
    filter = { $or: [
      { 'records.compiledRelease.buyer.id': id },
      { 'records.compiledRelease.parties.memberOf.id': id },
    ] };
  } else {
    filter = {
      'records.compiledRelease.awards.suppliers.id': id,
    };
  }
  // console.log('getContracts query', `db.records.find(${JSON.stringify(filter)},${JSON.stringify(options)})`);

  const contractsP = records.find(filter, options).catch(err => {
    // console.error("getContracts error",err);
    if (err) {
      return 'error: {err}';
    }
    return err;
  });

  return contractsP;
}

async function addContracts(collection, array, db) {
  // console.log("addContracts 1", array[1].length);
  for (const index in array[1]) {
    if (Object.prototype.hasOwnProperty.call(array[1], index)) {
      const item = array[1][index];

      // console.log("addContracts 2", index);
      const contracts = {
        buyer: await getContracts('buyer', item.id, db),
        seller: await getContracts('seller', item.id, db),
      };

      item.contracts = contracts;

      // console.log("addContracts",index,array[1][index].contracts.buyer.length,array[1][index].contracts.seller.length);
    }
  }
  return array;
}


module.exports = {
  personMemberMap,
  omitEmpty,
  simpleName,
  queryToPipeline,
  arrayResultsOptions,
  getQuery,
  allDocuments,
  addContracts,
  getDistinct,
  dataReturn,
};
