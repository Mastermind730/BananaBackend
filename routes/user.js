const express = require('express');
const db = require('../db');
const utils = require('../utils');
const config = require('../config');
const cryptoJs = require('crypto-js');
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');

const createUserRouter = (wss) => {
  const router = express.Router();

  const broadcastMessage = (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Get all users (only for admin)
  router.get('/users', authenticateJWT, authorizeRoles('ADMIN'), (request, response) => {
    const statement = `
      SELECT user_name, mobile_no, role
      FROM user
    `;
    db.pool.query(statement, (error, users) => {
      response.send(utils.createResult(error, users));
    });
  });

  // Get user by mobile number (only for admin)
  router.get('/users/:mobile_no', authenticateJWT, authorizeRoles('ADMIN'), (request, response) => {
    const { mobile_no } = request.params;
    const statement = `
      SELECT user_name, mobile_no, role
      FROM user
      WHERE mobile_no = ?
    `;
    db.pool.query(statement, [mobile_no], (error, users) => {
      const result = {};
      if (error) {
        result['status'] = 'error';
        result['error'] = error;
      } else {
        if (users.length === 0) {
          result['status'] = 'error';
          result['error'] = 'user does not exist';
        } else {
          const user = users[0];
          result['status'] = 'success';
          result['data'] = {
            user_name: user['user_name'],
            mobile_no: user['mobile_no'],
            role: user['role']
          };
        }
      }
      response.send(result);
    });
  });

  // Add user (only for admin)
  router.post('/users/add', authenticateJWT, authorizeRoles('ADMIN'), (request, response) => {
    const { user_name, mobile_no, role, password } = request.body;
    const encryptedPassword = String(cryptoJs.MD5(password));
    const statement = `
      INSERT INTO user (user_name, mobile_no, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.pool.query(statement, [user_name, mobile_no, encryptedPassword, role], (error, result) => {
      if (!error) {
        broadcastMessage({ event: 'userAdded', data: { user_name, mobile_no, role } });
      }
      response.send(utils.createResult(error, result));
    });
  });

  // Update user (only for admin)
  router.put('/users/:mobile_No', authenticateJWT, authorizeRoles('ADMIN'), (request, response) => {
    const { mobile_No } = request.params;
    const { mobile_no, role } = request.body;
    const statement = `
      UPDATE user
      SET 
        mobile_no = ?,
        role = ?
      WHERE mobile_no = ?
    `;
    db.pool.query(statement, [mobile_no, role, mobile_No], (error, user) => {
      response.send(utils.createResult(error, user));
    });
  });

  // Delete user
  router.delete('/users/:mobile_no', authenticateJWT, authorizeRoles('ADMIN'), (request, response) => {
    const { mobile_no } = request.params;
    const statement = `
      DELETE FROM user WHERE mobile_no = ?
    `;
    db.pool.query(statement, [mobile_no], (error, user) => {
      response.send(utils.createResult(error, user));
    });
  });

  return router;
};

module.exports = createUserRouter;
