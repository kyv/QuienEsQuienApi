const db = require('../db');
const collection = db.get('ocds', { castIds: false });
const getQuery = require('./lib').getQuery;
const dataReturn = require('./lib').dataReturn;

function allReleases(req, res) {
  const query = getQuery(req);
  const offset = query.options.skip || 0;
  const resultsP = collection.find(query.criteria, query.options);
  const countP = collection.count(query);

  return Promise.all([countP, resultsP])
    .then(array => (dataReturn(res, array, offset, null, null)));
}

function singleRelease(req, res) {
  const query = getQuery(req);

  collection.findOne(query.criteria, query.options)
    .then(docs => (dataReturn(res, [1, docs], 0, true, null)));
}

module.exports = {
  allReleases,
  singleRelease,
};
