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
  // console.log("autocomplete",query);
  var results = [];
  persons.find({'name':{'$regex':query.criteria.name}},query.options,query.fields)
            .then( person_docs => {
                results = results.concat(person_docs);
                // console.log('persons', person_docs);
                organizations.find({'name':{'$regex':query.criteria.name}},query.options,query.fields)
                        .then( org_docs => {
                            results = results.concat(org_docs);
                            // console.log('orgs', org_docs);
                            contracts.find({'title':{'$regex':query.criteria.name}},query.options,query.fields)
                                    .then( contract_docs => {
                                        results = results.concat(contract_docs);
                                        // console.log('contracts', contract_docs);
                                        dataReturn(res,[1,results],0,true,function(a) {return a});
                                    } );
                        } );
            });
}

module.exports = {
  autocomplete
};
