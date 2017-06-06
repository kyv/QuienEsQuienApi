const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const persons = db.get('persons', { castIds: false });
const testData = require('./persons-test-data.json');

describe('controllers', function() {

  describe('persons', function() {

    describe('GET /v1/persons', function() {

      before(function(done) {
        persons.insert(testData).then((docs) => done());
      });

      it('should return 3 persons', function(done) {

        request(server)
          .get('/v1/persons')
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

        persons.findOne().then((doc) => {
          const id = doc._id;
          const path = `/v1/persons/${id}`;

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

      it('should accept a query parameter', function(done) {
        request(server)
          .get('/v1/persons')
          .query({ simple: 'martha puente castillo'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('martha puente castillo');

            done();
          });
      });

      it('should accept a regex query parameter', function(done) {
        request(server)
          .get('/v1/persons')
          .query({ name: '/martha/i'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('martha puente castillo');

            done();
          });
      });

      it('should accept query for $exists', function(done) {
        request(server)
          .get('/v1/persons?contract_count')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            // console.log(res.body);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(4);

            done();
          });
      });
    });
  });

  after(function() {
    persons.drop(() => (db.close()))
  });
});
