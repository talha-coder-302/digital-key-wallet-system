const express = require('express');
const userController = require(`${__controller}/user`);
const keyController = require(`${__controller}/key`);

const router = express.Router();
require(`${__routes}/user`)(router, userController);
require(`${__routes}/key`)(router, keyController);


module.exports = router;
