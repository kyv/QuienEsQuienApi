const monk = require('monk');
const dbConnect = process.env.MONGODB_URI || 'localhost:27017/da39a3ee5';
const db = monk(dbConnect);

db.then(() => {
  process.stdout.write(`Connected to mongod server: ${dbConnect}\n`);
});
db.catch(err => {
  console.error("Mongo Error: ",err);

  //We should exit if no connection is made. I'm excluding production to test this.
  if (process.env.NODE_ENV !== "production") {
    process.exit();
  }
})

module.exports = db;
