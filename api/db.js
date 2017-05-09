'use strict';

const monk = require('monk');
// var q2m = require('query-to-mongo');
//     mongoSanitize = require('express-mongo-sanitize');
// import { returnData } from './var/lib.js';
// npm install swagger-express-middleware

let dbString = 'localhost:27017/meteor';
const db = monk(dbString);

db.then(() => {
  console.log('Connected to mongod server');
});

const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const contracts = db.get('contracts', { castIds: false });

module.exports = db;
