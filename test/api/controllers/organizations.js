const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const collection = db.get('organizations', { castIds: false });
const cName = collection.name;
const PATH = `/v1/${cName}`;
const testDataJson = require('./test-data.json');
const testData = testDataJson[cName];

describe('controllers', function() {

  describe('organizations', function() {

    describe(`GET ${PATH}`, function() {

      before(function(done) {
        collection.insert(testData).then((docs) => done());
      });

      after(function(done) {
        collection.drop(() => (done()))
      });

      it('should simplify person simple param', done => {

        collection.findOne().then(doc => {
          request(server)
            .get(PATH)
            .set('Accept', 'application/json')
            .query({ simple: doc.name })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              res.body.status.should.eql('success');
              res.body.data.should.not.eql([]);
              res.body.data[0].name.should.eql(doc.name);
              res.body.data[0].simple.should.eql(doc.simple);

              done();
            });
        });

      });

      it('should accept a query parameter', function(done) {
        request(server)
          .get(PATH)
          .query({ simple: 'quality lab systems sa de cv'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('quality lab systems sa de cv');

            done();
          });
      });

      it('should accept a regex query parameter', function(done) {
        request(server)
          .get(PATH)
          .query({ name: '/aguilas/i'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('las aguilas construye sa de cv');

            done();
          });
      });

      it('should accept query for $exists', function(done) {
        request(server)
          .get(`${PATH}?contract_count`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(4);

            done();
          });
      });
    });

  });


});
