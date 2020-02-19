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

//TODO: Estos lookups deben ser de estados, empresas, instituciones y persons
const membershipJoins = [
  {
    $lookup: {
      from: 'memberships',
      localField: 'id',
      foreignField: 'compiledRelease.organization_id',
      as: 'memberships.child',
    },
  },
  {
    $lookup: {
      from: 'memberships',
      localField: 'id',
      foreignField: 'compiledRelease.parent_id',
      as: 'memberships.parent',
    },
  },
  // {
  //   $lookup: {
  //     from: 'organizations',
  //     localField: 'memberships.child.organization_id',
  //     foreignField: 'id',
  //     as: 'memberships.child_expanded',
  //   },
  // },
];


function aggregateCountries(array,embed) {
  // console.log("aggregateCountries 1",array);

  let countriesList = [];

  for (c in array) {
    try {
    // console.log("aggregateCountries 2");
      for (s in array[c]) {
        // console.log("aggregateCountries 3",c,s,array[c][s]._id);
        const countryId = array[c][s]._id;
        if (countriesList.indexOf(countryId) == -1) {
          countriesList.push(array[c][s]._id);
        }
        // if (c < 2) {
        //   if (array[c][s]._id.hasOwnProperty("source")) {
        //     sourceName = array[c][s]._id.source;
        //     collectionName =  array[c][s]._id["classification"];
        //   }
        //   else {
        //     sourceName = array[c][s]._id;
        //   }
        //   // console.log("aggregateSources",s,c,parseInt(array[c][s].count));
        //
        //   if (!sources[sourceName]) {
        //     sources[sourceName] = {};
        //   }
        //   if (!sources[sourceName][collectionName]) {
        //     sources[sourceName][collectionName] = {
        //       count: 0,
        //     };
        //   }
        //
        //   sources[sourceName][collectionName].count += parseInt(array[c][s].count);
        //   sources[sourceName][collectionName].lastModified = array[c][s].lastModified;
        // }
      }
    }
    catch (e) {
      console.error("Countries: Processing error:",e);
    }
  }
  countriesList.sort();

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

function getCountryData(countryId,embed) {
  if (countries.isValid(countryId)) {
    let countryData = { id: countryId, compiledRelease: { id: countryId, name: countries.getName(countryId,"es") }};
    if (embed) {
      countryData.summaries = {
        top_states: [],
        top_organizations: [],
        top_persons: [],
        top_mujeres: []
      }
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
  let match = {$match: { "compiledRelease.area.classification": "country" }};
  if (id) {
    match.$match["compiledRelease.area.id"] = id;
  }

  const queries = [
    // 0: organizations countries count
    db.get("organizations").aggregate([
        {$unwind: "$compiledRelease.area"},
        match,
        {$group: {_id: "$compiledRelease.area.id", count: {$sum: 1}}}
    ]),
    // 1: persons countries count
    db.get("persons").aggregate([
        {$unwind: "$compiledRelease.area"},
        match,
        {$group: {_id: "$compiledRelease.area.id", count: {$sum: 1}}}
    ])
  ];

  console.log("allCountries")
  if (debug) {
    console.log("allCountries",id,match);
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

module.exports = {
  allCountries,
  singleCountry
};
