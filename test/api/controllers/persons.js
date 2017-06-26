/* eslint-env mocha */
const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const collection = db.get('persons', { castIds: false });
const cName = collection.name;
const PATH = `/v1/${cName}`;
const testDataJson = require('./test-data.json');
const testData = testDataJson[cName];

describe('controllers', () => {

  describe('persons', () => {

    describe('GET /v1/persons', () => {

      before(done => {
        collection.insert(testData).then(() => done());
      });

      after(done => {
        collection.drop(() => (done()));
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

      it('should accept a query parameter', done => {
        request(server)
          .get('/v1/persons')
          .query({ simple: 'martha puente castillo' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('martha puente castillo');

            done();
          });
      });

      it('should accept a regex query parameter', done => {
        request(server)
          .get('/v1/persons')
          .query({ name: '/martha/i' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].simple.should.eql('martha puente castillo');

            done();
          });
      });

      it('should accept query for $exists', done => {
        request(server)
          .get('/v1/persons?contract_count')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            // console.log(res.body);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(4);

            done();
          });
      });
    });

  });

});
