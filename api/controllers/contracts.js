'use strict';

const db = require('../db');
const contracts = db.get('contracts', { castIds: false });

module.exports = {
  allContracts: allContracts,
  singleContract: singleContract,
};

function allContracts(req, res, next) {
  contracts.find({}, { limit: 10 }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        size: docs.length,
        message: 'Retrieved ALL persons',
      });
  });
}

function singleContract(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var id = req.swagger.params._id.value;
  contracts.find({ _id: id }).then(docs => {
    res.json({
        status: 'success',
        data: docs,
        message: 'Retrieved person',
      });
  });
  // this sends back a JSON response which is a single string
}
