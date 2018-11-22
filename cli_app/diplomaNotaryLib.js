require("dotenv").config();
const Web3 = require('web3');
const jsSHA = require("jssha");
const fs = require("fs");

let web3 = undefined;
let contract = undefined;

function init () {
  //set up network
  const provider = new Web3.providers.HttpProvider(process.env.ETH_HOST);
  web3 = new Web3(provider);

  //contract abi
  const abi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "addDocHash",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "findDocHash",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
  ];

  // Assign address
  address = process.env.ETH_CONTRACT;
  //init contract
  contract = new web3.eth.Contract(abi,address);
};

function reverseString(str) {
  // Step 1. Use the split() method to return a new array
  var splitString = str.split(""); // var splitString = "hello".split("");

  // Step 2. Use the reverse() method to reverse the new created array
  var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();

  // Step 3. Use the join() method to join all elements of the array into a string
  var joinArray = reverseArray.join(""); // var joinArray = ["o", "l", "l", "e", "h"].join("");
  
  return joinArray;
}

//get a SHA-256 hash from a file --> works synchronously
function calculateHash (fileName) {
  let fileContent = fs.readFileSync(fileName);
  return calculateHashBytes(fileContent);
};

function calculateReversedHash (fileName) {
  let fileContent = fs.readFileSync(fileName);
  return calculateReversedHashBytes(fileContent);
};

//get a SHA-256 hash from a data Buffer --> works synchronously
function calculateHashBytes (data) {
  let shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
  shaObj.update(data);
  hash = "0x" + shaObj.getHash("HEX");
  return hash;
};

function calculateReversedHashBytes (data) {
  let shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
  shaObj.update(data);
  hash = "0x" + reverseString(shaObj.getHash("HEX"));
  return hash;
};

//sends a hash to the blockchain
function sendHash (hash, callback) {
  const result = new Promise((resolve, reject) => {
    web3.eth.getAccounts(function (error, accounts) {
      if(error) console.error(error);
      contract.methods.addDocHash(hash).send({
        from: accounts[0]
      },function(error, tx) {
        if (error) reject(error);
        else resolve(tx);
      });
    });
  });

  return result;
};

//looks up a hash on the blockchain
function findHash (hash) {
  const result = new Promise((resolve, reject) => {
    contract.methods.findDocHash(hash).call( function (error, result) {
      if (error) reject(error);
      else {
        if(result[1] === '0') {
          reject(false)
        } else {
          let resultObj = {
            mineTime:  new Date(result[0] * 1000),
            blockNumber: result[1]
          }
          resolve(resultObj);
        }
      }
    });
  });
  return result;
};

const checkHash = async (hash) => {
  try {
    const result = await findHash(hash);
    return result;
  } catch (error) {
    console.error(error);
  }
}

const addHash = async (hash) => {
  try {
    const result = await sendHash(hash)
    return result;
  } catch (error) {
    console.error(error);
  }
}

const removeHash = async (hash) => {
  try {
    const result = await sendHash(hash)
    return result;
  } catch (error) {
    console.error(error);
  }
}

let DiplomaExports = {
  findHash,
  sendHash,
  calculateHash,
  calculateReversedHash,
  init,
  calculateHashBytes,
  calculateReversedHashBytes,
  checkHash,
  addHash,
  removeHash
};

module.exports = DiplomaExports;
