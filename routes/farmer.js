const express = require('express')
const db = require('../db')
const utils = require('../utils')
const config = require('../config')
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');
const WebSocket = require('ws');

const createUserRouter = (wss) => {
  
const router = express.Router();
const broadcastMessage = (wss, message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

//get all farmers

router.get('/farmers', authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
const statement=`
SELECT farmer_name,mobile_no,location
FROM farmer

`
db.pool.query(statement,(error,farmer)=>{
    response.send(utils.createResult(error,farmer))
})
})

//get farmer by mobile no
router.get('/farmers/:mobile_no', authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {mobile_no}=request.params
    const statement=`
    SELECT farmer_name,location,mobile_no
    FROM farmer
    WHERE mobile_no=?
    `
    db.pool.query(
        statement,
        [mobile_no],
        (error,farmers)=>{
        const result={}
        if (error) {
            result['status'] = 'error'
            result['error'] = error
          } else {
            if (farmers.length === 0) {
              result['status'] = 'error'
              result['error'] = 'farmer does not exist'
            } else {
              // authentication is successful
              const farmer = farmers[0]
              result['status'] = 'success'
              result['data'] = {
                farmer_name: farmer['farmer_name'],
                mobile_no: farmer['mobile_no'],
    location:farmer['location']
             
              }
            }
        }
        response.send(result)
})
})

//add farmer
router.post('/farmers/add',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {farmerName,farmerMobile,geolocation}=request.body;
    console.log(request.body);
    const statement=`
    INSERT INTO farmer (farmer_name,mobile_no,location)
    VALUES (?,?,?)
    `

    db.pool.query(statement, [farmerName, farmerMobile, geolocation], (error, result) => {
        if (!error) {
          // Broadcast to WebSocket clients
          broadcastMessage(wss, { event: 'farmerAdded', data: { farmerName, farmerMobile, geolocation } });
        }
        response.send(utils.createResult(error, result));
      });
})
//update farmer
router.put('/farmers/:mobile_No',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {mobile_No}=request.params;
    const {mobile_no,location}=request.body
    const statement=`
    UPDATE farmer
    SET 
    mobile_no=?,
    location=?
    WHERE mobile_no=?
    `
    db.pool.query(
        statement,
        [mobile_no,location,mobile_No],
        (error,farmer)=>{
            response.send(utils.createResult(error,farmer))
        }
    )
})
//delete farmer
router.delete('/farmers/:mobile_no',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {mobile_no}= request.params
    const statement=`
    DELETE FROM farmer WHERE mobile_no=?
    `
    db.pool.query(
        statement,mobile_no,(error,farmer)=>{
            response.send(utils.createResult(error,farmer))
        }
    )
})
return router;
};

module.exports = createUserRouter;
          