/* eslint-env mocha */
const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const collection = db.get('ocds', { castIds: false });
const PATH = '/v1/releases.json';
const testDataJson = require('./test-data.json');
const testData = testDataJson.releases;

describe('controllers', () => {

  describe('releases', () => {

    describe(`GET ${PATH}`, () => {

      before(done => {
        collection.insert(testData).then(() => done());
      });

      after(done => {
        collection.drop(() => (done()));
      });

      it('should accept a query parameter', done => {
        request(server)
          .get(PATH)
          .query({ ocid: 'OCDS-0UD2Q6-AA-002000997-E9-2016' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].ocid.should.eql('OCDS-0UD2Q6-AA-002000997-E9-2016');

            done();
          });
      });

      it('should accept a regex query parameter on nested field', done => {
        request(server)
          .get(PATH)
          .query({ 'parties.name': '/UNIVERSAL EXTINTORES/i' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].ocid.should.eql('OCDS-0UD2Q6-AA-002000997-E9-2016');

            done();
          });
      });

      it('should accept query for $exists', done => {
        request(server)
          .get(`${PATH}?awards.value.amount`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(2);

            done();
          });
      });
    });


  });


});
