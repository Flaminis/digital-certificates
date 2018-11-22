require("dotenv").config();
const express = require('express');
const router = express.Router();
const multer  = require('multer');

// Diploma
const notary = require('../cli_app/diplomaNotaryLib.js');

const storage = multer.memoryStorage()

const upload = multer({ 
  storage: storage
});

router.post('/', upload.single('diploma-file'), function (req, res, next) {
  if(!req.body.password || req.body.password !== process.env.PASS) {
    req.session.sessionFlash = {
      type: 'danger',
      title: 'Неверный пароль'
    }
    return res.redirect(301, '/add');
  }
  if (!req.file) {
    req.session.sessionFlash = {
      type: 'warning',
      title: 'Нет файла'
    }
    return res.redirect(301, '/add');
  }

  notary.init();

  let hash = notary.calculateHashBytes(req.file.buffer);

  notary.checkHash(hash)
    .then(result => {
      if(!result) {
        notary.addHash(hash)
          .then(tx => {
            req.session.sessionFlash = {
              type: 'success',
              title: 'Файл загружен', 
              message: `
              Хэш: ${hash},<br/>
              ID транзакции: <a href="https://rinkeby.etherscan.io/tx/${tx}">${tx}</a><br/>
              Отправлено с контракта: ${process.env.ETH_CONTRACT}<br/>
              <b>Пожалуйста, подождите пару минут, пока транзакция будет выполнена.</b>
              `
            }
            return res.redirect(301, '/add');
          }).catch(error => console.error(error))
      } else {
        req.session.sessionFlash = {
          type: 'warning',
          title: 'Этот документ уже есть в сети', 
          message: `
          Хэш: ${hash},<br/>
          Номер блока: <a href="https://etherscan.io/block/${result.blockNumber}">${result.blockNumber}</a>
          `
        }
        return res.redirect(301, '/add');
      }
    })
    .catch(error => console.error(error));
});

module.exports = router;
