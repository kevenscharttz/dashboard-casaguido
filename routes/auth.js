<<<<<<< HEAD
// const express = require('express');
// const router = express.Router();
// const { login, register } = require('../controllers/authController');

// router.post('/login', login);
// router.post('/register', register);
=======
const express = require('express');
const router = express.Router();
const {login} = require('../controllers/authController');

router.post('/login', login);
>>>>>>> ac05d96457d4513a80fa255dfec187c53db53adb

// module.exports = router;
