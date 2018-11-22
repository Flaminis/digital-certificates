const express = require('express');
const router = express.Router();
const multer  = require('multer');

// Diploma
const notary = require('../cli_app/diplomaNotaryLib.js');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  // fileFilter: function (req, file, cb) {
  //   if (storage.extension(file.originalname) !== '.pdf') {
  //     req.session.sessionFlash = {
  //       type: 'error',
  //       title: 'Загрузите PDF'
  //     }
  //     return cb(null, false)
  //   }

  //   cb(null, true)
  // }
});

router.post('/', upload.single('diploma-file'), function(req, res, next) {
  if (!req.file) {
    req.session.sessionFlash = {
      type: 'warning',
      title: 'Нет файла'
    }
    return res.redirect(301, '/');
  }

  notary.init();

  let hash = notary.calculateHashBytes(req.file.buffer);
  let reversedHash = notary.calculateReversedHashBytes(req.file.buffer);

  notary.checkHash(reversedHash)
    .then(result => {
      if(!result) {
        notary.checkHash(hash)
          .then(result2 => {
            if(!result2) {
              req.session.sessionFlash = {
                type: 'warning',
                title: 'Такого файла нет в сети'
              }
              return res.redirect(301, '/');
            } else {
              req.session.sessionFlash = {
                type: 'success',
                title: 'Этот документ есть в сети', 
                message: `
                Хэш: ${hash}, <br/>
                Номер блока: <a href="https://etherscan.io/block/${result2.blockNumber}">${result2.blockNumber}</a>
                `
              }
              return res.redirect(301, '/');
            }
          }).catch(error => console.error(error));
      } else {
        req.session.sessionFlash = {
          type: 'warning',
          title: 'Этот документ был изъят', 
          message: `
          Хэш: ${hash}, <br/>
          Номер блока: <a href="https://etherscan.io/block/${result.blockNumber}">${result.blockNumber}</a>
          `
        }
        return res.redirect(301, '/');
      }
    })
    .catch(error => console.error(error));
});

module.exports = router;
