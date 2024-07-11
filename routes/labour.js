const express = require('express')
const db = require('../db')
const utils = require('../utils')
const config = require('../config')
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');
const { wss } = require('../server');
const router = express.Router();

const createUserRouter = (wss) => {
// Broadcast function
const broadcastMessage = (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
//get all labours

router.get('/labours',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
const statement=`
SELECT labour_name,labour_mobile,contractor_name
FROM labour

`
db.pool.query(statement,[request],(error,labour)=>{
    response.send(utils.createResult(error,labour))
})
})

//get labour by contractor name
router.get('/labours/:contractor_name',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {contractor_name}=request.params
    const statement=`
    SELECT labour_name,labour_mobile,contractor_name
    FROM labour
    WHERE contractor_name=?
    `
    db.pool.query(
        statement,
        [contractor_name],
        (error,labours)=>{
        const result={}
        if (error) {
            result['status'] = 'error'
            result['error'] = error
          } else {
            if (labours.length === 0) {
              result['status'] = 'error'
              result['error'] = 'labour does not exist'
            } else {
              // authentication is successful
              const labour = labours[0]
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

//add labour
router.post('/labours/add',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {labor_name,labor_mobile,team_contractor,contractor_mobile}=request.body;
    const statement=`
    INSERT INTO labour (labour_name,labour_mobile,contractor_name,contractor_mobile)
    VALUES (?,?,?,?)
    `
    console.log(request);

    db.pool.query(statement, [labor_name, labor_mobile, team_contractor, contractor_mobile], (error, result) => {
        if (!error) {
          broadcastMessage({ event: 'labourAdded', data: { labor_name, labor_mobile, team_contractor, contractor_mobile } });
        }
        response.send(utils.createResult(error, result));

      });
})
//update labour
router.put('/labours/:mobile_No',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {mobile_No}=request.params;
    const {mobile_no}=request.body
    const statement=`
    UPDATE labour
    SET 
    mobile_no=?
    WHERE mobile_no=?
    `
    db.pool.query(
        statement,
        [mobile_no,mobile_No],
        (error,labour)=>{
            response.send(utils.createResult(error,labour))
        }
    )
})
//delete labour
router.delete('/labours/:mobile_no',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
    const {mobile_no}= request.params
    const statement=`
    DELETE FROM labour WHERE mobile_no=?
    `
    db.pool.query(statement, [mobile_no], (error, labour) => {
        if (!error) {
          broadcastMessage({ event: 'labourDeleted', data: { mobile_no } });
        }
        response.send(utils.createResult(error, labour));
      });
})
return router;
};

module.exports = createUserRouter;