pragma solidity ^0.4.4;


contract Diploma {
    struct Record {
        uint mineTime;
        uint blockNumber;
    }

    mapping (bytes32 => Record) private docHashes;

    constructor() {
      // constructor
    }

    function addDocHash(bytes32 hash) public {
        Record memory newRecord = Record(now, block.number);
        docHashes[hash] = newRecord;
    }

    function findDocHash(bytes32 hash) public view returns (uint, uint) {
        return (docHashes[hash].mineTime, docHashes[hash].blockNumber);
    }
}

