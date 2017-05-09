'use strict';

const db = require('../db');
const organizations = db.get('organizations', { castIds: false });

module.exports = {
  allOrganizations: allOrganizations,
  singleOrganization: singleOrganization,
};

function allOrganizations(req, res, next) {
  organizations.find({}, { limit: 10 }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        size: docs.length,
        message: 'Retrieved ALL persons',
      });
  });
}

function singleOrganization(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var id = req.swagger.params._id.value;
  organizations.find({ _id: id }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        message: 'Retrieved person',
      });
  });
  // this sends back a JSON response which is a single string
}
