/* eslint-env mocha */
const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const db = require('../../../api/db');
const collection = db.get('memberships', { castIds: false });
const cName = collection.name;
const testDataJson = require('./test-data.json');
const testData = testDataJson[cName];
const PATH = `/v1/${cName}`;

describe('controllers', () => {

  describe(cName, () => {

    describe(`GET ${PATH}`, () => {

      before(done => {
        const mapped = testData.map(o => {
          const date = o.start_date;

          if (date) {
            o.start_date = new Date(date);
          }
          return o;
        });

        collection.insert(mapped).then(() => done());
      });

      after(done => {
        collection.drop(() => (done()));
      });

      it('should accept a query parameter', done => {
        request(server)
          .get(PATH)
          .query({ person_id: 'manuel echanove pasquin' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].person_id.should.eql('manuel echanove pasquin');

            done();
          });
      });

      it('should accept a regex query parameter', done => {
        request(server)
          .get(PATH)
          .query({ department: '/Unidad De Admon/i' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data[0].department.should.eql('Unidad De Admon. De Rec. Mat. Y Servs. Grales. 00');

            done();
          });
      });

      it('should accept query for $exists', done => {
        request(server)
          .get(`${PATH}?shares`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(1);

            done();
          });
      });

      it('should return all documents within a range of start_dates', done => {
        request(server)
          .get(`${PATH}?start_date>1999-09-12&start_date<2002-10-12`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(1);

            done();
          });
      });

      it('should return all posts for a given person within a range of start_dates', done => {
        request(server)
          .get(`${PATH}?person_id=ricardo argentino bussi&start_date>1999-09-12&start_date<2002-10-12`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(1);
            res.body.data[0].person_id.should.eql('ricardo argentino bussi');

            done();
          });
      });
      it('should return all persons for a given organization within a range of start_dates', done => {
        request(server)
          .get(`${PATH}?sob_org=senado de la nacion&start_date>1999-09-12&start_date<2002-10-12`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.status.should.eql('success');
            res.body.data.length.should.eql(1);
            res.body.data[0].sob_org.should.eql('senado de la nacion');

            done();
          });
      });
    });
  });
});
