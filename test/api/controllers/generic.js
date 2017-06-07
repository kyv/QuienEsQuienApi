const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const memberships = db.get('memberships', { castIds: false });
const contracts = db.get('contracts', { castIds: false });
const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const testDataJson = require('./test-data.json');

// test generic capabilities which should be good for all resources

const COLLECTIONS = [
  memberships,
  contracts,
  persons,
  organizations,
];

describe('controllers', function() {

  for (let i = 0; i < COLLECTIONS.length; i++) {
    const collection = COLLECTIONS[i];
    const cName = collection.name;
    const PATH = `/v1/${cName}`;
    const testData = testDataJson[cName];

    describe(cName, function() {

      describe(`GET ${PATH}`, function() {

        before(function(done) {
          collection.insert(testData).then((docs) => done());
        });

        after(function(done) {
          collection.drop(() => (done()))
        });

        it(`should return 5 ${cName}`, function(done) {

          request(server)
            .get(PATH)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.status.should.eql('success');
              res.body.data.length.should.eql(5);

              done();
            });
        });

        it('should accept a path parameter', function(done) {

          collection.findOne().then((doc) => {
            const id = doc._id;
            const path = `${PATH}/${id}`;

            request(server)
              .get(path)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.status.should.eql('success');
                res.body.data[0]._id.should.eql(id);

                done();
              });
          });

        });
      });
    });

  }

});
