const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../db');
const persons = db.get('persons', { castIds: false });
const testData = require('./persons-test-data');

describe('controllers', function() {

  describe('persons', function() {

    describe('GET /persons', function() {

      before(function(done) {
        // runs before all tests in this block
        persons.insert(testData).then(() => done());
      });

      after(function(done) {
        // runs after all tests in this block
        persons.drop.then(() => done())
      });

      it('should return 10 persons', function(done) {

        request(server)
          .get('/persons')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            console.log(res.body);
            res.body.length.should.eql(5);

            done();
          });
      });

      it('should accept a simple parameter', function(done) {

        request(server)
          .get('/persons')
          .query({ simple: 'fabrizio pagani'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.simple.should.eql('fabrizio pagani');

            done();
          });
      });

    });

  });

});
