exports.raw = [
// Type   Name                     Cmd?
  [0x00, "Ping",                   true ],
  [0x04, "NewWallet",              true ],
  [0x05, "NewAddress",             true ],
  [0x06, "GetNumberOfAddresses",   true ],
  [0x09, "GetAddressAndPublicKey", true ],
  [0x0a, "SignTransaction",        true ],
  [0x0b, "LoadWallet",             true ],
  [0x0d, "FormatWalletArea",       true ],
  [0x0e, "ChangeEncryptionKey",    true ],
  [0x0f, "ChangeWalletName",       true ],
  [0x10, "ListWallets",            true ],
  [0x11, "BackupWallet",           true ],
  [0x12, "RestoreWallet",          true ],
  [0x13, "GetDeviceUUID",          true ],
  [0x14, "GetEntropy",             true ],
  [0x15, "GetMasterPublicKey",     true ],
  [0x16, "DeleteWallet",           true ],
  [0x17, "Initialize",             true ],
  [0x18, "SetMaxFeeKb",            true ],
  [0x31, "NumberOfAddresses",      false],
  [0x32, "Wallets",                false],
  [0x33, "PingResponse",           false],
  [0x34, "Success",                false],
  [0x35, "Failure",                false],
  [0x36, "DeviceUUID",             false],
  [0x37, "Entropy",                false],
  [0x38, "MasterPublicKey",        false],
  [0x39, "Signature",              false],
  [0x3a, "Features",               false],
  [0x3b, "WalletUUID",             false],
  [0x50, "ButtonRequest",          false],
  [0x51, "ButtonAck",              false],
  [0x52, "ButtonCancel",           false],
  [0x53, "PinRequest",             false],
  [0x54, "PinAck",                 false],
  [0x55, "PinCancel",              false],
  [0x56, "OtpRequest",             false],
  [0x57, "OtpAck",                 false],
  [0x58, "OtpCancel",              false]
];

exports.byId = [];
exports.byName = {};
exports.cmds = [];
exports.raw.forEach(function (type) {
  var obj = {id: type[0], name: type[1], cmd: type[2]};
  exports.byId[obj.id] = obj;
  exports.byName[obj.name] = obj;
  if (obj.cmd) exports.cmds.push(obj);
});
