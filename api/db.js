const monk = require('monk');
// FIXME dbString should be loaded from ENV
const dbString = 'localhost:27017/meteor';
const db = monk(dbString);

db.then(() => {
  console.log('Connected to mongod server');
});

module.exports = db;
