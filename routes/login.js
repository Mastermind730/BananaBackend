const express = require('express');
const jwt = require('jsonwebtoken');
const cryptoJs = require('crypto-js');
const db = require('../db');
const utils = require('../utils');
const config = require('../config');

const router = express.Router();

// User login route
router.post('/login', (request, response) => {
  const { mobile_no, password } = request.body;

  console.log(request.body)
  const encryptedPassword = String(cryptoJs.MD5(password));

  const statement = `
    SELECT * FROM user WHERE mobile_no = ? AND password = ?
  `;
  db.pool.query(statement, [mobile_no, password], (error, users) => {
    console.log(error)
    console.log(users)
    if (error || users.length === 0) {
      return response.send({ status: 'error', error: 'Invalid credentials' });
    }

    const user = users[0];
    const token = jwt.sign(
      {
        id: user.user_id,
        user_name: user.user_name,
        mobile_no: user.mobile_no,
        role: user.role
      },
      config.secret,
      { expiresIn: '1h' }
    );

    response.send({
      status: 'success',
      data: {
        token,
        user: {
          user_name: user.user_name,
          mobile_no: user.mobile_no,
          role: user.role
        }
      }
    });
  });
});

module.exports = router;
