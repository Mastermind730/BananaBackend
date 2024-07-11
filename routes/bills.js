
const express = require('express')
const db = require('../db')
const utils = require('../utils')
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');
const router = express.Router();

//get all farmers bills

router.get('/farmer_bill', authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR','ACCOUNTANT'),(request,response)=>{
const statement=`
SELECT *
FROM farmer_bill
`
db.pool.query(statement,[request],(error,bill)=>{
    response.send(utils.createResult(error,bill))
})
})

//get specific farmer bill
router.get('/farmer_bill/:farmer_name',(request,response)=>{
    const {farmer_name}=request.params
    const statement=`
    SELECT *
    FROM farmer_bill
    WHERE farmer_name=?
    `
    db.pool.query(
        statement,
        [farmer_name],
        (error,bill)=>{
        const result={}
        if (error) {
            result['status'] = 'error'
            result['error'] = error
          } else {
            if (users.length === 0) {
              result['status'] = 'error'
              result['error'] = 'farmer bill does not exist'
            } else {
              // authentication is successful
              const user = users
              result['status'] = 'success'
              result['data'] =bill
             
              }
            }
        })
        response.send(result)
})




//get all labour bills

router.get('/labour_bill',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR','ACCOUNTANT'),(request,response)=>{
    const statement=`
    SELECT *
    FROM labour_bill
    `
    db.pool.query(statement,[request],(error,bill)=>{
        response.send(utils.createResult(error,bill))
    })
    })
    
    //get specific labour bill
    router.get('/labour_bill/:labour_name',(request,response)=>{
        const {labour_name}=request.params
        const statement=`
        SELECT *
        FROM labour_bill
        WHERE labour_name=?
        `
        db.pool.query(
            statement,
            [labour_name],
            (error,bill)=>{
            const result={}
            if (error) {
                result['status'] = 'error'
                result['error'] = error
              } else {
                if (users.length === 0) {
                  result['status'] = 'error'
                  result['error'] = 'labour bill does not exist'
                } else {
                  // authentication is successful
                  
                  result['status'] = 'success'
                  result['data'] =bill
                 
                  }
                }
            })
            response.send(result)
    })
    
    
//get all company bills

router.get('/company_bill',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR','ACCOUNTANT'),(request,response)=>{
    const statement=`
    SELECT *
    FROM company_bill
    `
    db.pool.query(statement,[request],(error,bill)=>{
        response.send(utils.createResult(error,bill))
    })
    })
    
    //get specific farmer bill
    router.get('/company_bill/:company_name',(request,response)=>{
        const {company_name}=request.params
        const statement=`
        SELECT *
        FROM company_bill
        WHERE Company_Name=?
        `
        db.pool.query(
            statement,
            [company_name],
            (error,bill)=>{
            const result={}
            if (error) {
                result['status'] = 'error'
                result['error'] = error
              } else {
                if (users.length === 0) {
                  result['status'] = 'error'
                  result['error'] = 'company bill does not exist'
                } else {
                  // authentication is successful
                  
                  result['status'] = 'success'
                  result['data'] =bill
                 
                  }
                }
            })
            response.send(result)
    })





module.exports = router