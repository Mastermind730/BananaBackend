const express = require('express')
const db = require('../db')
const utils = require('../utils')
const config = require('../config')
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');

const createUserRouter = (wss) => {
const router = express.Router();

//get all company

router.get('/company',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request,response)=>{
const statement=`
SELECT company_name,company_address,company_email,owner_name,owner_mobile,payment_relatedperson,payment_relatedpersoncontact,GSTIN
FROM company

`
db.pool.query(statement,[request],(error,company)=>{
    response.send(utils.createResult(error,company))
})
})



//add company
router.post('/company/add',authenticateJWT, authorizeRoles('ADMIN'),(request,response)=>{
    const {companyName,companyAddress,companyEmail,ownerName,ownerMobile,paymentPerson,paymentPersonContact,gstin}=request.body;
    console.log(request.body);
    const statement=`
    INSERT INTO company (company_name,company_address,company_email,owner_name,owner_mobile,payment_relatedperson,payment_relatedpersoncontact,GSTIN)
    VALUES (?,?,?,?,?,?,?,?)
    `

    db.pool.query(statement, [companyName, companyAddress, companyEmail, ownerName, ownerMobile, paymentPerson, paymentPersonContact, gstin], (error, result) => {
        if (!error) {
            // Notify all connected clients
            request.wss.broadcast({ type: 'COMPANY_ADDED', payload: { companyName, companyAddress, companyEmail, ownerName, ownerMobile, paymentPerson, paymentPersonContact, gstin } });
        }
        response.send(utils.createResult(error, result));
    });
})
//update company
router.put('/company/:company_name',authenticateJWT, authorizeRoles('ADMIN'),(request,response)=>{
    const {company_name}=request.params;
    const {payment_relatedperson,payment_relatedpersoncontact}=request.body
    const statement=`
    UPDATE company
    SET 
    payment_relatedperson=?,
    payment_relatedpersoncontact=?
    WHERE company_name=?
    `
    db.pool.query(statement, [payment_relatedperson, payment_relatedpersoncontact, company_name], (error, result) => {
        if (!error) {
            // Notify all connected clients
            request.wss.broadcast({ type: 'COMPANY_UPDATED', payload: { company_name, payment_relatedperson, payment_relatedpersoncontact } });
        }
        response.send(utils.createResult(error, result));
    });
})
//delete company
router.delete('/company/:company_name',authenticateJWT, authorizeRoles('ADMIN'),(request,response)=>{
    const {company_name}= request.params
    const statement=`
    DELETE FROM company WHERE company_name=?
    `
    db.pool.query(statement, [company_name], (error, result) => {
        if (!error) {
            // Notify all connected clients
            request.wss.broadcast({ type: 'COMPANY_DELETED', payload: { company_name } });
        }
        response.send(utils.createResult(error, result));
    });
})
return router;
};

module.exports = createUserRouter;
