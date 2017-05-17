const monk = require('monk');

const defaultDB = 'localhost:27017/meteor';
let dbConnect = process.env.MONGODB_URI;

if (!dbConnect) {
  dbConnect = defaultDB;
}
const db = monk(dbConnect);

db.then(() => {
  console.log('Connected to mongod server:');
  console.log(dbConnect);
});

module.exports = db;
