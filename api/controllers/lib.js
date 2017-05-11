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
const removeDiacritics = require('diacritics').remove;


function personMemberMap(doc) {
  const member = extend(doc, {
    org_id: doc.sob_org,
  });

  return omit(member, ['sob_org']);
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
};
