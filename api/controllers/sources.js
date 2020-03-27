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
  // console.log("aggregateSources",array);

  let sources = {};
  let collections = {};
  for (c in array) {
    let collectionName = "";
    try {
    switch (c) {
      // 0: organizations sources count
      case "0":
        collectionName = "organizations";
        break;
      // 1: persons sources count
      case "1":
        collectionName = "persons";
        break;
      // 2: organizations type count
      case "2":
        for (e in array[c]) {
          collections[array[c][e]._id] = {
            count: array[c][e].count,
            lastModified: null,
          }
        }
        break;
      // 3: persons count
      case "3":
        collections.persons = {
          count: array[c],
          lastModified: null,
        }
        break;
      // 4: records count
      case "4":
        collections.contracts = {
          count: array[c],
          lastModified: null,
        }
        break;
      // 5: organizations lastModified
      case "5": //orgs date
        for (d in array[c]) {
          lastModified = array[c][d].lastModified;
          collections[array[c][d]._id].lastModified = lastModified;
        }
        // console.log(c,array[c]);
        break;
      // 6: persons lastModified
      case "6": //persons date
        // console.log(c,array[c][0].date);
        collectionName = "persons";
        lastModified = array[c][0].compiledRelease.date;
        collections[collectionName].lastModified = lastModified;
        break;
      // 7: records lastModified
      case "7": //contract date
        // console.log("contract date",c,array[c][0].compiledRelease.date);
        collectionName = "contracts";
        lastModified = array[c][0].compiledRelease.date;
        collections[collectionName].lastModified = lastModified;
        break;
      default:
        console.log("Unhandled query",c);
        collectionName = c;
    }
    // console.log("aggregateSources 1");

    for (s in array[c]) {
      // console.log("aggregateSources 2",c,s,array[c][s]._id);
      let sourceName = "";
      if (c < 2) {
        if (array[c][s]._id.hasOwnProperty("source")) {
          sourceName = array[c][s]._id.source;
          collectionName =  array[c][s]._id["classification"];
        }
        else {
          sourceName = array[c][s]._id;
        }
        // console.log("aggregateSources",s,c,parseInt(array[c][s].count));

        if (!sources[sourceName]) {
          sources[sourceName] = {};
        }
        if (!sources[sourceName][collectionName]) {
          sources[sourceName][collectionName] = {
            count: 0,
          };
        }

        sources[sourceName][collectionName].count += parseInt(array[c][s].count);
        sources[sourceName][collectionName].lastModified = array[c][s].lastModified;
      }
    }
    }
    catch (e) {
      console.error("Sources: Processing error:",e);
    }
  }
  // console.log("aggregateSources s",sources);
  return [sources.length, [{sources: sources, collections: collections}]];
}

function allSources(req, res) {

  const queries = [
    // 0: organizations sources count
    db.get("organizations").aggregate([{$unwind: "$compiledRelease.source"},{$group: {_id: {source:"$compiledRelease.source.id",classification:"$compiledRelease.classification"}, count: {$sum:1}, lastModified: {$max:"$compiledRelease.date"} }}], {maxTimeMS: 3000 }),
    // 1: persons sources count
    db.get("persons").aggregate([{$unwind: "$compiledRelease.source"},{$group: {_id: "$compiledRelease.source.id", count: {$sum:1}, lastModified: {$max:"$compiledRelease.date"}}}], {maxTimeMS: 3000 }),
    // 2: organizations type count
    db.get("organizations").aggregate([{$unwind: "$compiledRelease.classification"},{$group: {_id: "$compiledRelease.classification", count: {$sum:1}}}], {maxTimeMS: 3000 }),
    // 3: persons count
    db.get("persons").count(),
    // 4: records count
    db.get("records").count({hidden: false}),
    // 5: organizations lastModified
    db.get("organizations").aggregate([{$unwind: "$compiledRelease.classification"},{$group: {_id: "$compiledRelease.classification", lastModified: {$max:"$compiledRelease.date"}}}], {maxTimeMS: 3000 }),
    // 6: persons lastModified
    db.get("persons").find({},{projection: {"compiledRelease.date": 1}, sort: {"compiledRelease.date": -1}, limit: 1}, {maxTimeMS: 3000 }),
    // 7: records lastModified
    db.get("records").find({},{projection: {"compiledRelease.date": 1}, sort: {"compiledRelease.date": -1}, limit: 1}, {maxTimeMS: 3000 }),
    // 8: contracts sources count
    // db.get("records").aggregate([{$unwind: "$compiledRelease.source"},{$group: {_id: "$compiledRelease.source.id", count: {$sum:1}}}]),
  ];

  // console.log("allSources")

  Promise.all(queries)
    .then(array => {
      // console.log("allSources",array);

      return dataReturn(res, aggregateSources(array), 0, 0, false, (a)=>a, false);
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
