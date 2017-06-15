const monk = require('monk');
const dbConnect = process.env.MONGODB_URI || 'localhost:27017/da39a3ee5';
const db = monk(dbConnect);

db.then(() => {
  console.log('Connected to mongod server:');
  console.log(dbConnect);
});

module.exports = db;
