const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const memberships = db.get('memberships', { castIds: false });
const contracts = db.get('contracts', { castIds: false });
const persons = db.get('persons', { castIds: false });
const organizations = db.get('organizations', { castIds: false });
const testDataJson = require('./test-data.json');
const extend = require('lodash/extend');

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

      before(function(done) {
        const mapped = testData.map(o => (extend(o, {created_at: new Date('2016-06-10')})));
        collection.insert(mapped).then(() => done());
      });

      after(function(done) {
        collection.drop(() => (done()))
      });

      describe(`GET ${PATH}`, function() {

        it(`should return distinct values ${cName}`, function(done) {
          const path = `${PATH}/distinct/source`;

          collection.distinct('source').then(docs => {
            request(server)
              .get(path)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.status.should.eql('success');
                res.body.data.should.not.eql([]);
                res.body.data.length.should.eql(docs.length);

                done();
              });
          });

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

        it(`should accept query param`, function(done) {

          collection.findOne().then((doc) => {
            const id = doc._id;
            const path = `${PATH}/${id}`;

            request(server)
              .get(PATH)
              .query({ _id: id })
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

        it(`should accept multiple comma sepereated query param`, function(done) {

          collection.find({}, {limit: 2}).then((docs) => {
            const ids = docs.map(o => (o._id));
            const CSV = ids.join(',');
            const path = `${PATH}?_id=${CSV}`;

            request(server)
              .get(path)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.status.should.eql('success');
                res.body.data.should.not.eql([]);
                res.body.data.map(o => o._id).should.eql(ids);

                done();
              });
          });
        });

        it('should accept range query param', function(done) {
          const dateString = '2016-06-6';
          const dateObject = new Date(dateString);

          collection.find({ created_at: { $gt: dateObject } })
          .then(docs => {
            const ids = docs.map(o => (o._id));
            const path = `${PATH}?created_at>${dateString}`;

            request(server)
              .get(path)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.status.should.eql('success');
                res.body.data.should.not.eql([]);
                res.body.data.map(o => o._id).should.eql(ids);

                done();
              });
          });
        });
      });

      describe(`POST ${PATH}`, function() {

        it('should post query', function(done) {

          collection.findOne()
          .then(doc => {
            const id = doc._id;
            request(server)
              .post(PATH)
              .send({ query: { _id: id } })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.status.should.eql('success');
                res.body.data.should.not.eql([]);
                res.body.data.map(o => o._id).should.eql([id]);

                done();
              });
          });
        });

      it('should post query multiple', function(done) {
        collection.find()
        .then(docs => {
          const ids = docs.map(o => (o._id));

          request(server)
            .post(PATH)
            .send({ query: { _id: { $in: ids } } })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.status.should.eql('success');
              res.body.data.should.not.eql([]);
              res.body.data.map(o => o._id).should.eql(ids
              );

              done();
            });
        });
      });
      });
    });
  }
});
