'use strict';

const db = require('../db');
const persons = db.get('persons', { castIds: false });
const q2m = require('query-to-mongo');

module.exports = {
  allPersons: allPersons,
  singlePerson: singlePerson,
};

function allPersons(req, res, next) {

  const params = req.swagger.params;
  console.log(req.swagger);

  persons.find({}, { limit: 10 }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        size: docs.length,
        message: 'Retrieved ALL persons',
      });
  });
}

function singlePerson(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var id = req.swagger.params._id.value;
  persons.find({ _id: id }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        message: 'Retrieved person',
      });
  });
  // this sends back a JSON response which is a single string
}
