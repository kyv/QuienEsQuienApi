const db = require('../db');
const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const contracts = db.get('contracts', { castIds: false });
const getQuery = require('./lib').getQuery;
const dataReturn = require('./lib').dataReturn;

function autocomplete(req, res) {
  const query = getQuery(req);

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
            o.type = 'organization';
          });
          results = results.concat(orgDocs);
          // console.log('orgs', org_docs);
          contracts.find({ title: { $regex: query.criteria.name, $options: 'i' } }, query.options, query.fields)
            .then(contractDocs => {
              contractDocs.forEach(c => {
                c.type = 'contract';
              });
              results = results.concat(contractDocs);
              // console.log('contracts', contractDocs);
              dataReturn(res, [1, results], 0, true, a => a);
            });
        });
    });
}

module.exports = {
  autocomplete,
};
