var fs = require('fs');
var crypto = require('crypto');
var Schema = require('protobuf').Schema;
var HID = require('node-hid');
var buffertools = require('buffertools');
var async = require('async');
var schema = new Schema(fs.readFileSync('data/messages.pb'));
var types = require('./data/packet_types');

var PACKET_LENGTH_LIMIT = 1000000;

var bitsafeDeviceInfo;
var devices = HID.devices();
devices.forEach(function (dev) {
  if (dev.vendorId === 0x04f3 && dev.productId === 0x0210) {
    bitsafeDeviceInfo = dev;
  }
});

if (!bitsafeDeviceInfo) {
  console.error("Could not find BitSafe hardware.");
  process.exit(1);
}

var device = new HID.HID(bitsafeDeviceInfo.path);

function sendMessage(type, data, callback)
{
  if ("number" === typeof type) type = types.byId[type];
  else if ("string" === typeof type) type = types.byName[type];
  else throw new Error("Invalid packet type requested!");

  data = data || {};

  if ("function" === typeof data) {
    callback = data;
    data = {};
  }
  if ("function" !== typeof callback) callback = function () {};

  console.log(">>>", type.name, data);

  var pb = schema[type.name];

  var msg = pb.serialize(data);

  var packet = [
    // Magic bytes
    0x23, 0x23,
    // Command type
    type.id >> 8,
    type.id & 0xff,
    // Message length
    (msg.length >> 24) & 0xff,
    (msg.length >> 16) & 0xff,
    (msg.length >> 8 ) & 0xff,
    (msg.length      ) & 0xff
  ];

  packet = buffertools.concat(new Buffer(packet), msg);

  // Convert to array
  packet = Array.prototype.slice.apply(packet);

  // XXX Split into 63 byte (max) packets

  packet.unshift(packet.length & 0xff);

  //console.log(new Buffer(packet).toString('hex'));
  device.write(packet);
  var response = [];
  var responseId = (response[2] << 8) + response[3];
  var targetLength = PACKET_LENGTH_LIMIT;

  function readResponse() {
    device.read(function (err, data) {
      if (err) {
        callback(err);
        return;
      }

      response = response.concat(data.slice(1));

      // Once header is ready to be read
      if (response.length > 8) {
        responseId = (response[2] << 8) + response[3];
        targetLength =
          (response[4] << 24) +
          (response[5] << 16) +
          (response[6] <<  8) +
          (response[7]      ) +
          8;
      }

      if (response.length < targetLength) {
        readResponse();
      } else {
        handleResponse(responseId, response.slice(8, targetLength));
      }
    });
  }

  function handleResponse(id, msg) {
    var type = types.byId[id];
    var pb = schema[type.name];

    var parsed = pb.parse(new Buffer(msg));

    console.log("<<<", type.name, parsed);

    callback(null, type.name, parsed);
  }

  readResponse();
}

function ping(callback) {
  sendMessage("Ping", callback);
}

function deviceuuid(callback) {
  sendMessage("GetDeviceUUID", callback);
}

function formatwalletarea(callback) {
  sendMessage("FormatWalletArea", {
    initialEntropyPool: crypto.randomBytes(32)
  }, callback);
}

function listwallets(callback) {
  sendMessage("ListWallets", function (err, type, data) {
    data.walletInfo.forEach(function (wallet) {
      console.log("... WALLET #"+wallet.walletNumber+": "+wallet.walletName.toString("utf8"));
    });
    callback(err);
  });
}

function loadwallet(callback) {
  sendMessage("LoadWallet", {walletNumber: 0});
}

function entropy(callback) {
  sendMessage("GetEntropy", { numberOfBytes: 16 });
}

async.series([
  ping,
  deviceuuid,
  //formatwalletarea,
  //listwallets,
  //loadwallet,
  entropy
], function (err) {
  if (err) console.error(err);
});

