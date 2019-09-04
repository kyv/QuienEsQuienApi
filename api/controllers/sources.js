const db = require('../db');
const collection = db.get('records', { castIds: false });
// const omit = require('lodash/omit');
// const omitEmpty = require('./lib').omitEmpty;
const queryToPipeline = require('./lib').queryToPipeline;
const getQuery = require('./lib').getQuery;
const allDocuments = require('./lib').allDocuments;
const getDistinct = require('./lib').getDistinct;
const dataReturn = require('./lib').dataReturn;



function aggregateSources(array) {
  console.log("aggregateSources",array);

  let sources = {};
  let collections = {};
  for (c in array) {
    let collectionName = "";
    switch (c) {
      case "0":
        collectionName = "organizations";
        break;
      case "1":
        collectionName = "persons";
        break;
      case "2":
        collections.organizations = array[c];
        break;
      case "3":
        collections.persons = array[c];
        break;
      case "4":
      collections.contracts = array[c];
        break;
      default:
        collectionName = c;
    }
    // console.log("aggregateSources 1");

    for (s in array[c]) {
      // console.log("aggregateSources 2",array[c][s]._id);
      let sourceName = "";
      if (array[c][s]._id.hasOwnProperty("source")) {
        sourceName = array[c][s]._id.source;
        collectionName =  array[c][s]._id.classification;
      }
      else {
        sourceName = array[c][s]._id;
      }
      // console.log("aggregateSources",s,c,parseInt(array[c][s].count));

      if (!sources[sourceName]) {
        sources[sourceName] = {};
      }
      if (!sources[sourceName][collectionName]) {
        sources[sourceName][collectionName] = 0;
      }
      // if (!collections[collectionName]) {
      //   collections[collectionName] = 0;
      // }
      sources[sourceName][collectionName] += parseInt(array[c][s].count);
      // collections[collectionName] += parseInt(array[c][s].count);
    }

  }
  // console.log("aggregateSources s",sources);
  return [sources.length, [{sources: sources, collections: collections}]];
}

function allSources(req, res) {

  const queries = [
    db.get("organizations").aggregate([{$unwind: "$source"},{$group: {_id: {source:"$source",classification:"$classification"}, count: {$sum:1}}}]),
    db.get("persons").aggregate([{$unwind: "$source"},{$group: {_id: "$source", count: {$sum:1}}}]),
    // db.get("records").aggregate([{$unwind: "$source"},{$group: {_id: "$source", count: {$sum:1}}}]),
    db.get("organizations").count(),
    db.get("persons").count(),
    db.get("records").count(),
  ];

  console.log("allSources")

  Promise.all(queries)
    .then(array => {
      // console.log("allSources",array);

      return dataReturn(res, aggregateSources(array), 0, 0, false, (a)=>a, true);
    })
    .catch(err => {
      // console.error('allContracts', err);
      if (err) {
        return err;
      }
      return false;
    });
}

module.exports = {
  allSources,
};
