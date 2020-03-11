const db = require('../db');
const collection = db.get('records', { castIds: false });
// const omit = require('lodash/omit');
// const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;
const countries = require("i18n-iso-countries");

function aggregateCountries(array,embed) {
  console.log("aggregateCountries 1",array);

  let countriesList = [];

  for (c in array) {
    try {
    // console.log("aggregateCountries 2");
      for (s in array[c]) {
        // console.log("aggregateCountries 3",c,s,array[c][s]._id);
        const countryId = array[c][s].pais;
        if (countriesList.indexOf(countryId) == -1) {
          countriesList.push(array[c][s]);
        }
      }
    }
    catch (e) {
      console.error("Countries: Processing error:",e);
    }
  }
  // countriesList.sort();

  const countriesData = [];

  for (c in countriesList) {
    const countryData = getCountryData(countriesList[c], embed);
    if (countryData) {
      countriesData.push(countryData);
    }
  }
  // console.log("aggregateCountries s",sources);
  return [countriesData.length, countriesData];
}

function getCountryData(originalCountryData,embed) {
  let countryId = originalCountryData.pais;
  if (countries.isValid(countryId)) {
    let countryData = { id: countryId,
      compiledRelease: {
        id: countryId,
        name: countries.getName(countryId,"es"),
        summaries: {
          persons_count: originalCountryData.persons,
          companies_count: originalCountryData.companies,
          stock_exchanges_count: originalCountryData["stock-exchanges"],
          states_count: originalCountryData.states,
          institutions_count: originalCountryData.institutions,
          mujeres_ranking: originalCountryData.ranking,
          mujeres: originalCountryData["mujeres"],
          bolsas: originalCountryData.bolsas,
        }
      }
    };
    if (countryId == "mx") {
      countryData.compiledRelease.summaries.estados =  originalCountryData.estados;
    }
    return countryData;
  }
  else {
    return null;
  }
}



function singleCountry(req, res) {
  const debug = req.query.debug;

  if (req.swagger.params.id) {
    console.log("singleCountry",req.swagger.params.id.value);
    const debug = req.query.debug;
    const countryData = getCountryData(req.swagger.params.id.value, true);
    dataReturn(res, [1, countryData], 0, true, 0, getCountryData, debug);
  }
  else {
    console.error("singleCountry error: No country id specified.")
  }
}

function allCountries(req, res) {
  const debug = req.query.debug;
  const embed = req.query.embed;

  const id = (req.swagger.params.id) ? req.swagger.params.id.value : "";

  if (id && embed == "true") {
    const queries = [
      // 0: mujeres data
      db.get('mujeres_en_la_bolsa').find({id: id})
    ];

    // console.log("allCountries id embed")
    if (debug) {
      console.log("allCountries id embed 2",JSON.stringify(queries));
    }

    Promise.all(queries)
      .then(array => { return [1, array[0]]})
      .catch(err => {
        console.error('allCountries id embed query error', err);
        if (err) {
          return err;
        }
        return false;
      })
      .then(array => {
        // console.log("aggregateCountries 0",array);

        return dataReturn(res, array, 0, 0, embed, a=>a, debug);
      })
      .catch(err => {
        console.error('aggregateCountries id embed error', err);
        if (err) {
          return err;
        }
        return false;
      });

  }
  else {
      let match = {$match: {}};

      if (id) {
        match.$match = {"pais": id};
        lookups = [
          { $lookup: {
              from: 'mujeres_en_la_bolsa',
              localField: "pais",
              foreignField: "id",
              as: "mujeres"
          } },
          { $unwind: "$mujeres" },
          { $lookup: {
              from: 'organizations',
              let: { 'idpais': '$pais' },
              pipeline: [
                  { $unwind: '$compiledRelease.area' },
                  { $match: { $expr: {
                      $and: [
                          {$eq: ['$compiledRelease.area.id', '$$idpais']},
                          {$eq: ['$compiledRelease.area.classification', 'country']},
                          {$eq: ['$compiledRelease.subclassification', 'stock-exchange']},
                      ]
                  }}}
              ],
              as: 'bolsas'
              }
          },
          { $lookup: {
                  from: 'organizations',
                  let: { 'idpais': '$pais' },
                  pipeline: [
                      { $match: { $expr: {$eq: ['$compiledRelease.classification', 'state']} }},
                      { $lookup: {
                              from: 'organizations',
                              let: { 'state': '$compiledRelease.id' },
                              pipeline: [
                                  { $match: { $expr: { $and: [
                                      {$eq: ['$compiledRelease.classification', 'municipality']},
                                      {$eq: ['$compiledRelease.parent_id', '$$state']},
                                  ] } }},
                                  { $group: {
                                      '_id': 0,
                                      'count': { $sum: 1 }
                                  } },
                                  { $project: { '_id': 0 } }
                              ],
                              as: 'municipios'
                          }
                      },
                      { $sort: { 'municipios.count': -1 } }
                  ],
                  as: 'estados'
              }
          }
        ]
      }

      const queries = [
        // 0: organizations countries count
        db.get('countries').aggregate([
          match,
          ... lookups,
          {$sort: {"pais": 1}}
        ])
      ];

      // console.log("allCountries")
      if (debug) {
        console.log("allCountries",JSON.stringify(queries));
      }

      Promise.all(queries)
        .then(array => (aggregateCountries(array, debug)))
        .catch(err => {
          console.error('allCountries query error', err);
          if (err) {
            return err;
          }
          return false;
        })
        .then(array => {
          // console.log("aggregateCountries 0",array);

          return dataReturn(res, array, 0, 0, embed, a=>a, debug);
        })
        .catch(err => {
          console.error('aggregateCountries error', err);
          if (err) {
            return err;
          }
          return false;
        });
    }

}

module.exports = {
  allCountries,
  singleCountry
};
