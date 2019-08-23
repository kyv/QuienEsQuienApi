const db = require('../db');
const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const contracts = db.get('records', { castIds: false });
const getQuery = require('./lib').getQuery;
const dataReturn = require('./lib').dataReturn;

function autocomplete(req, res) {
  const debug = req.query.debug;
  const query = getQuery(req, debug);

  query.options = { limit: 10 };
  query.fields = { name: 1, simple: 1 };

  if (!query.criteria.name) {
    query.criteria.name = '';
  }
  // console.log("autocomplete",query);
  let results = [];

  persons.find({ name: { $regex: query.criteria.name, $options: 'i' } }, query.options, query.fields)
    .then(personDocs => {
      personDocs.forEach(p => {
        p.type = 'person';
      });
      results = results.concat(personDocs);
      organizations.find({ name: { $regex: query.criteria.name, $options: 'i' } }, query.options, query.fields)
        .then(orgDocs => {
          orgDocs.forEach(o => {
            o.type = o.classification;
          });
          results = results.concat(orgDocs);
          // console.log('orgs', org_docs);
          contracts.find({ "compiledRelease.contracts.title": { $regex: query.criteria.name, $options: 'i' } }, query.options, query.fields)
            .then(contractDocs => {
              contractDocs.forEach(c => {
                c.type = 'contract';
              });
              results = results.concat(contractDocs);
              if (debug) {
                console.log('contracts', contractDocs);
              }
              dataReturn(res, [1, results], 0, query.options.limit, false, a => a);
            });
        });
    })
    .catch(err => {
      console.error("autocomplete error",err);
      res.json({"error": "error"})
    });
}

module.exports = {
  autocomplete,
};
