/* eslint-env mocha */
const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const collection = db.get('contracts', { castIds: false });
const cName = collection.name;
const PATH = `/v2/${cName}`;
const testDataJson = require('./test-data.json');
const testData = testDataJson[cName];

describe('controllers', () => {

  describe(cName, () => {

    describe(`GET ${PATH}`, () => {

      before(done => {
        collection.insert(testData).then(() => {
          // collection.find({}).then(data => { console.log("data",data); });
          done();
        });

      });

      after(done => {
        collection.drop(() => (done()));
      });

      it('should accept a query parameter', done => {
        request(server)
          .get(PATH)
          .query({ records_compiledRelease_ocid: 'OCDS-0UD2Q6-IA-018TOQ040-I193-2012' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            // console.log(res.body);
            res.body.status.should.eql('success');
            res.body.data[0].records.compiledRelease.ocid.should.eql('OCDS-0UD2Q6-IA-018TOQ040-I193-2012');

            done();
          });
      });

      it('should accept a regex query parameter', done => {
        request(server)
          .get(PATH)
          .query({ records_compiledRelease_contracts_title: '/EQUIPO DE CÓMPUTO/i' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].records.compiledRelease.ocid.should.eql('OCDS-0UD2Q6-IA-901026999-N82-2012');

            done();
          });
      });

      // it('should accept query for $exists', done => {
      //   request(server)
      //     .get(`${PATH}?currency`)
      //     .set('Accept', 'application/json')
      //     .expect('Content-Type', /json/)
      //     .expect(200)
      //     .end((err, res) => {
      //       should.not.exist(err);
      //       res.body.status.should.eql('success');
      //       res.body.data.length.should.eql(4);
      //
      //       done();
      //     });
      // });
    });


  });


});
