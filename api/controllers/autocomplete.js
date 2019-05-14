const db = require('../db');
const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const contracts = db.get('contracts', { castIds: false });
const omit = require('lodash/omit');
const personMemberMap = require('./lib').personMemberMap;
const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;

function autocomplete(req, res) {
  const query = getQuery(req);
  query.options={limit: 10};
  query.fields={name:1,simple:1};
  console.log("autocomplete",query);
  return persons.find(query.criteria,query.options,query.fields).then(docs=>dataReturn(res,[1,docs],0,true,function(a) {return a}));
}

module.exports = {
  autocomplete
};
