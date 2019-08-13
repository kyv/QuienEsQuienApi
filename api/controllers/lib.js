const flow = require('lodash/fp/flow');
const omitBy = require('lodash/fp/omitBy');
const isArray = require('lodash/fp/isArray');
const isEmpty = require('lodash/fp/isEmpty');
const isDate = require('lodash/fp/isDate');
const isObject = require('lodash/fp/isObject');
const isString = require('lodash/fp/isString');
const clone = require('lodash/fp/clone');
const orderBy = require('lodash/fp/orderBy');
const slice = require('lodash/fp/slice');
const isNil = require('lodash/fp/isNil');
const extend = require('lodash/extend');
const omit = require('lodash/omit');
const find = require('lodash/find');
const q2m = require('query-to-mongo');
const qs = require('qs');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const removeDiacritics = require('diacritics').remove;
const sanitize = require('mongo-sanitize');
const parser = require('mongo-parse');
const moment = require('moment');
// FIXME we should modify or replace `swagger_params_parser`
// fitting instead of reparsing params here

// https://www.npmjs.com/package/query-to-mongo#field-selection

function parseDates(string) {
  if (typeof string === 'number') {
    return string;
  }
  if (typeof string === 'object') {
    return string;
  }
  // console.log('parseDates',string);
  const object = new Date(string);
  const isValidDate = moment(object).isValid();

  if (isValidDate) {
    return object.toISOString();
  }
  return string;
}

function simpleName(string) {
  return removeDiacritics(string)
    .replace(/[,.]/g, '') // remove commas and periods
    .toLowerCase();
}

function getQuery(req) {
  const params = pickBy(req.swagger.params, p => (p.value));
  const sane = sanitize(req.query);

  const mapped = mapValues(params, p => (p.value));

  extend(sane, mapped);

  // console.log('getQuery',sane);
  //
  // // Fix underscore to dot params
  // for (const paramName in sane) {
  //   if (Object.prototype.hasOwnProperty.call(sane, paramName) ) {
  //     // console.log('min', paramName, sane[paramName]);
  //     const dotParamName = paramName.replace(/_/g, '.');
  //
  //     sane[dotParamName] = sane[paramName];
  //     // sane[dotParamName].parameterObject.name=dotParamName;
  //     if (dotParamName !== paramName) {
  //       delete sane[paramName];
  //     }
  //   }
  // }

  const string = qs.stringify(sane);

  // console.log(string);
  const query = q2m(string, { ignore: 'embed' });
  // console.log('getQuery',query);

  // Fix array criteria
  for (const criteria in query.criteria) {
    if (criteria.indexOf('[') > -1) {
      const cleanCriteria = criteria.substr(0, criteria.indexOf('['));
      const obj = {};

      if (!query.criteria.$and) {
        query.criteria.$and = [];
      }
      obj[cleanCriteria] = query.criteria[criteria];
      query.criteria.$and.push(obj);
      // console.log("a2",query.criteria.$and);
      // Object.assign(query.criteria,and);
      delete query.criteria[criteria];
    }
  }

  // console.log("getQuery",JSON.stringify(query));

  const parsed = parser.parse(query.criteria);

  // console.log("getQuery parsed",JSON.stringify(parsed,null,4));

  query.criteria = parsed.mapValues((field, value) => (parseDates(value)));
  // console.log("getQuery criteria",query.criteria);
  query.embed = (isString(sane.embed));
  return query;
}

function getDistinct(req, res, collection) {
  const field = req.swagger.params.field.value;
  const sane = sanitize(req.query);
  const string = qs.stringify(sane);
  const query = q2m(string, { ignore: 'embed' });

  res.set('Content-Type', 'application/json; charset=utf-8');
  return collection.distinct(field, query.criteria)
    .then(data => {
      const size = data.length;

      res.json({
        status: 'success',
        data,
        size,
      });
    });
}

function queryToPipeline(query, JOINS) {
  JOINS.unshift({
    $match: query.criteria,
  });
  return JOINS;
}

function arrayResultsOptions(query, pipeline) {
  if (query.options.sort) {
    pipeline.push({ $sort: query.options.sort });
  }
  if (query.options.skip) {
    pipeline.push({ $skip: query.options.skip });
  }
  if (query.options.limit) {
    pipeline.push({ $limit: query.options.limit });
  }

  return pipeline;
}

function personMemberMap(doc) {
  const member = extend(doc, {
    org_id: doc.sob_org,
  });

  return omit(member, ['sob_org']);
}

function allDocuments(query, collection, JOINS) {
  const countP = collection.count(query.criteria);

  if (query.embed) {
    const p = queryToPipeline(query, clone(JOINS));
    const pipeline = arrayResultsOptions(query, p);

    // console.log("allDocuments pipeline",query,JSON.stringify(pipeline,null,4));

    const resultsP = collection.aggregate(pipeline);

    return Promise.all([countP, resultsP]);
  }

  // console.log("allDocuments query",JSON.stringify(query));

  const resultsP = collection.find(query.criteria, query.options).catch(err => {
    // console.error("allDocuments",err);
    if (err) {
      return 'error: {err}';
    }
    return err;
  });

  return Promise.all([countP, resultsP]);
}

function omitEmpty(object) {
  return flow(
    omitBy(isNil),
    omitBy(v => (isArray(v) && isEmpty(v))),
    omitBy(v => (isString(v) && isEmpty(v))),
    omitBy(v => (!isDate(v) && isObject(v) && isEmpty(v)))
  )(object);
}

function dataReturn(res, array, offset, embed, objectFormat) {
  // console.log("dataReturn",array);

  let data = array[1];

  // Contracts have a different structure and their length comes in the third item in the array
  // console.log("dataReturn",array);
  const size = array[2] || array[1].length;

  if (embed) {
    data = array[1].map(o => (objectFormat(o)));
  }

  res.set('Content-Type', 'application/json; charset=utf-8');
  res.json({
    status: 'success',
    data,
    size,
    offset,
    pages: Math.ceil((array[0] / size)),
    count: array[0],
  });
}


async function getContracts(type, id, db, limit) {
  const records = db.get('records', { castIds: false });
  const options = { limit: `-${limit}`, sort: { 'compiledRelease.total_amount': -1 } };
  let filter = {};

  if (type === 'buyer') {
    filter = { $or: [
      { 'compiledRelease.buyer.id': id },
      { 'compiledRelease.parties.memberOf.id': id },
    ] };
  } else {
    filter = {
      'compiledRelease.awards.suppliers.id': id,
    };
  }
  // console.log('getContracts query', `db.records.find(${JSON.stringify(filter)},${JSON.stringify(options)})`);

  const contractsP = records.find(filter, options).catch(err => {
    // console.error("getContracts error",err);
    if (err) {
      return 'error: {err}';
    }
    return err;
  });

  return contractsP;
}

function addLink(relationSummary, link) {
  if (relationSummary.links.length > 1000) {
    return false;
  }

  const source = find(relationSummary.nodes, { label: link.source });
  const target = find(relationSummary.nodes, { label: link.target });

  if (source && target) {

    // console.log('addLink',link,sourceId,target.id);
    // if (!source.fixedWeight){
    //   source.weight = source.weight + 0.5;
    // }
    const existentLink = find(relationSummary.links, { source: source.id, target: target.id });

    if (!existentLink) {
      // console.log('addLink',link);
      relationSummary.links.push({ id: relationSummary.links.length, source: source.id, target: target.id, weight: link.weight || 0 });
    } else {
      existentLink.weight += link.weight;
    }
  }
  // else {
  //   console.error('Faltó agregar algún nodo', link);
  // }
  return true;
}
function addNode(relationSummary, node) {
  if (relationSummary.nodes.length > 400) {
    return false;
  }

  if (!find(relationSummary.nodes, { label: node.label })) {
    // console.log('addNode',node);
    node.id = relationSummary.nodes.length;
    relationSummary.nodes.push(node);
  }
  return true;
}


function calculateSummaries(orgID, records) {
  // console.log('calculateSummaries',records.length);

  //  Generar los objetos para cada gráfico
  const yearSummary = {};
  const typeSummary = {};
  const allBuyers = {};
  const allSuppliers = {};
  const relationSummary = { nodes: [], links: [] };

  for (const r in records) {
    if (Object.prototype.hasOwnProperty.call(records, r)) {
      const compiledRelease = records[r].compiledRelease;

      for (const c in compiledRelease.contracts) {
        if (Object.prototype.hasOwnProperty.call(compiledRelease.contracts, c)) {
          const contract = compiledRelease.contracts[c];
          const award = find(compiledRelease.awards, { id: contract.awardID });
          const buyerParty = find(compiledRelease.parties, { id: compiledRelease.buyer.id });
          const memberOfParty = find(compiledRelease.parties, 'memberOf');
          // console.log('calculateSummaries memberOfParty', memberOfParty.memberOf[0].id === orgID, buyerParty.id === orgID || memberOfParty.memberOf[0].id === orgID);
          const procurementMethod = compiledRelease.tender.procurementMethod;
          const isSupplierContract = find(award.suppliers, { id: orgID }) || false;
          const isBuyerContract = buyerParty.id === orgID || memberOfParty.memberOf[0].id === orgID;
          const year = new Date(contract.period.startDate).getFullYear();

          // To calculate top3buyers
          if (!isBuyerContract) {
            if (!allBuyers[memberOfParty.id]) {
              allBuyers[memberOfParty.id] = memberOfParty;
              allBuyers[memberOfParty.id].contract_amount_top_buyer = 0;
              allBuyers[memberOfParty.id].type = buyerParty.type;
            }
            allBuyers[memberOfParty.id].contract_amount_top_buyer += award.value.amount;
          }

          if (!yearSummary[year]) {
            yearSummary[year] = {
              buyer: { value: 0, count: 0 },
              supplier: { value: 0, count: 0 },
            };
          }

          // TODO: sumar los amounts en MXN siempre
          if (isSupplierContract) {
            yearSummary[year].supplier.value += parseInt(contract.value.amount, 10);
            yearSummary[year].supplier.count += 1;
          }
          if (isBuyerContract) {
            yearSummary[year].buyer.value += parseInt(contract.value.amount, 10);
            yearSummary[year].buyer.count += 1;
          }


          if (!typeSummary[procurementMethod]) {
            typeSummary[procurementMethod] = {
              buyer: { value: 0, count: 0 },
              supplier: { value: 0, count: 0 },
            };
          }

          if (isSupplierContract) {
            typeSummary[procurementMethod].supplier.value += parseInt(contract.value.amount, 10);
            typeSummary[procurementMethod].supplier.count += 1;
          }
          if (isBuyerContract) {
            typeSummary[procurementMethod].buyer.value += parseInt(contract.value.amount, 10);
            typeSummary[procurementMethod].buyer.count += 1;
          }



          // TODO: sumar los amounts en MXN siempre

          // organización 1
          if (buyerParty.memberOf.name) {
            addNode(relationSummary, { label: buyerParty.memberOf.name, type: buyerParty.details.type });
          }
          addNode(relationSummary, { label: buyerParty.name, weight: 50, type: buyerParty.details.type });
          addNode(relationSummary, { label: procurementMethod, type: 'procurementMethod' });

          if (buyerParty.memberOf.name) {
            addLink(relationSummary, { source: buyerParty.name, target: buyerParty.memberOf.name });
          }
          addLink(relationSummary, { source: buyerParty.name, target: procurementMethod });


          for (const a in award.suppliers) {
            if (Object.prototype.hasOwnProperty.call(award.suppliers, a)) {
              const supplierParty = find(compiledRelease.parties, { id: award.suppliers[a].id });

              if (supplierParty) {
                addNode(relationSummary, { label: award.suppliers[a].name, type: supplierParty.details.type });
                addLink(relationSummary, { source: procurementMethod, target: award.suppliers[a].name, weight: parseInt(contract.value.amount, 10) });

                // To calculate top3suppliers
                if (!allSuppliers[supplierParty.id]) {
                  allSuppliers[supplierParty.id] = supplierParty;
                  allSuppliers[supplierParty.id].contract_amount_top_supplier = 0;
                }
                allSuppliers[supplierParty.id].contract_amount_top_supplier += award.value.amount;
              }
              // else {
              //   console.error('Party id error','award:',award,'parties:',compiledRelease.parties);
              // }
            }
          }
        }
      }
    }
  }
  // console.log("allBuyers",sortBy('contract_amount_top_buyer', allBuyers))

  //Cut the top 3 of all ordered by contract amount, except the current org
  delete allBuyers[orgID];
  delete allSuppliers[orgID];
  const top3buyers = slice(0, 3, orderBy('contract_amount_top_buyer', 'desc', allBuyers));
  const top3suppliers = slice(0, 3, orderBy('contract_amount_top_supplier', 'desc', allSuppliers));

  const summary = {
    year: yearSummary,
    type: typeSummary,
    relation: relationSummary,
    top_buyers: top3buyers,
    top_suppliers: top3suppliers,
  };

  return summary;
}

async function addGraphs(collection, array, db) {
  // This is too slow fow more than one item
  if (array[1].length > 1) {
    return array;
  }
  for (const index in array[1]) {
    if (Object.prototype.hasOwnProperty.call(array[1], index)) {
      const item = array[1][index];

      // console.log('addContracts 2', index);
      const buyerContracts = await getContracts('buyer', item.id, db, 100);
      const supplierContracts = await getContracts('supplier', item.id, db, 100);
      const allContracts = [...buyerContracts, ...supplierContracts];

      // extend(allContracts, supplierContracts);
      // extend(allContracts, buyerContracts);
      // console.log('addGraphs',allContracts.length);

      item.summaries = calculateSummaries(item.id, allContracts);
      item.top3contracts = {
        buyer: buyerContracts.slice(0, 3),
        supplier: supplierContracts.slice(0, 3),
      };

      // console.log('addContracts',index,array[1][index].contracts.buyer.length,array[1][index].contracts.seller.length);
    }
  }
  return array;
}

module.exports = {
  personMemberMap,
  omitEmpty,
  simpleName,
  queryToPipeline,
  arrayResultsOptions,
  getQuery,
  allDocuments,
  addGraphs,
  getDistinct,
  dataReturn,
};
