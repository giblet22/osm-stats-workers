// example handler to handle kinesis stream input

// load environmental variables
require('dotenv').config();

var Worker = require('../../');
var Promise = require('bluebird');

exports.handler = function (event, context) {
  console.log('osm-stats-version ' + require('./package.json').version);

  // loop through all records in batch
  console.log('Processing %s records', event.Records.length);

  var worker = new Worker(function (err, changeset) {
    if (err) console.error(err);
    else console.log(changeset);
  });
  return Promise.map(event.Records, function (record) {
    var payload = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    console.log('PAYLOAD:', payload);
    return worker.addToDB(JSON.parse(payload));
  }).then(function (result) {
    return worker.destroy().then(function () {
      console.log('SUCCESS:', result);
      return context.succeed('Success');
    });
  }).catch(function (err) {
    return context.fail(err);
  });
};
