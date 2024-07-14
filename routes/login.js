const express = require('express');
const jwt = require('jsonwebtoken');
const cryptoJs = require('crypto-js');
const db = require('../db');
const config = require('../config');

const router = express.Router();

// User login route
router.post('/login', (request, response) => {
  const { mobile_no, password } = request.body;

  if (!mobile_no || !password) {
    return response.status(400).send({ status: 'error', error: 'Missing mobile number or password' });
  }

  const encryptedPassword = String(cryptoJs.MD5(password));

  const statement = `
    SELECT * FROM user WHERE mobile_no = ? AND password = ?
  `;
  db.pool.query(statement, [mobile_no, password], (error, users) => {
    if (error) {
      console.error('Database query error:', error);
      return response.status(500).send({ status: 'error', error: 'Internal server error' });
    }

    if (users.length === 0) {
      return response.status(401).send({ status: 'error', error: 'Invalid credentials' });
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
