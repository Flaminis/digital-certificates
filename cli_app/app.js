const notary = require('./diplomaNotaryLib.js');
const commandLineArgs = require('command-line-args');

const cmdOptions = [
  {
    name: "add",
    alias: "a",
    type: String
  },
  {
    name: "find",
    alias: "f",
    type: String
  },
  {
    name: "remove",
    alias: "r",
    type: String
  }
];

const options = commandLineArgs(cmdOptions);

notary.init();

// Добавление
// Проверяем есть ли такой хеш, или удален
// Возвращаем результат
if (options.add) {
  console.log("Sending hash for file: " + options.add);
  let hash = notary.calculateHash(options.add);
  console.log("SHA-256 hash value: " + hash);
  notary.checkHash(hash)
    .then(result => {
      if(!result) {
        notary.addHash(hash).then(result => console.log("Transaction ID: " + result))
      } else {
        console.log("Has value found at block No.: " + result.blockNumber);
        console.log("Mine time: " + result.mineTime);
      }
    })
    .catch(error => console.error(error));
}
else if (options.find) {
  console.log("Looking up hash for file: " + options.find);
  let hash = notary.calculateHash(options.find);
  console.log("SHA-256 hash value: " + hash);
  notary.checkHash(hash)
    .then(result => {
      if(!result) {
        console.log("Hash value not found on blockchain");
      } else {
        console.log("Has value found at block No.: " + result.blockNumber);
        console.log("Mine time: " + result.mineTime);
      }
    })
    .catch(error => console.error(error));
}
else if (options.remove) {
  console.log("Removing hash for file: " + options.remove);
  let hash = notary.calculateReversedHash(options.remove);
  console.log("SHA-256 hash value: " + hash);
  notary.checkHash(hash)
    .then(result => {
      if(!result) {
        notary.removeHash(hash).then(result => console.log("Removed. Transaction ID: " + result))
      } else {
        console.log("Has value found at block No.: " + result.blockNumber);
        console.log("Mine time: " + result.mineTime);
      }
    })
    .catch(error => console.error(error));
}
else {
  console.log("Illegal command line options");
}
