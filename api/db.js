const monk = require('monk');
const dbConnect = process.env.MONGODB_URI || 'localhost:27017/da39a3ee5';
const db = monk(dbConnect);

db.then(() => {
  process.stdout.write(`Connected to mongod server: ${dbConnect}\n`);
});

module.exports = db;
