const jwt = require('jsonwebtoken');
const utils = require('./utils');
const config = require('./config');

const authenticateJWT = (request, response, next) => {
  if (request.url === '/harvest/login') {
    next();
  } else {
    const token = request.headers['token'];
    if (!token || token.length === 0) {
      response.send(utils.createResult('token is missing'));
    } else {
      try {
        // Verify token and extract payload
        const payload = jwt.verify(token, config.secret);
        // Add user information to the request
        request.user = payload;
        next();
      } catch (ex) {
        response.send(utils.createResult('invalid token'));
      }
    }
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).send(utils.createResult('Forbidden: Insufficient privileges'));
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
