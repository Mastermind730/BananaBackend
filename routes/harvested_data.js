const express = require('express')
const db = require('../db')
const utils = require('../utils')
const config = require('../config')
const { authenticateJWT, authorizeRoles } = require('../authMiddleware');

//const bodyParser = require('body-parser');
//const twilio = require('twilio');
const createUserRouter = (wss) => {
const router = express.Router();

// Twilio credentials
//const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
//const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
//const client = twilio(accountSid, authToken);


// Middleware
//router.use(bodyParser.urlencoded({ extended: false }));

// get data by farmer mobile_na
router.get('/harvested_data/:mobile_no',authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'), (request, response) => {
    const { mobile_no } = request.params
    const statement = `
SELECT * FROM harvest_data where mobile_no=?
`
    db.pool.query(
        statement,
        [mobile_no],
        (error, harvestdata) => {
            const result = {}
            if (error) {
                result['status'] = 'error'
                result['error'] = error
            } else {
                if (harvestdata.length === 0) {
                    result['status'] = 'error'
                    result['error'] = 'data does not exist'
                } else {
                    // authentication is successful
                    const harvest_data = harvestdata;
                    result['status'] = 'success'
                    result['data'] = harvest_data
                }
            }
            response.send(result)
        })
})

//get all data
router.get("/harvested_data", authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),(request, response) => {
    const statement = `
    SELECT * FROM harvest_data
    `
    db.pool.query(statement, request, (error, data) => {
        response.send(utils.createResult(error, data))
    })
})


//add harvested data
router.post('/harvested_data', authenticateJWT, authorizeRoles('ADMIN','SUPERVISOR'),async (request, response) => {
    const harvestData = request.body;

    try {
        const result = await db.pool.query('INSERT INTO harvest_data SET ?', harvestData);
        console.log('Harvest data inserted:', result);
        const BillData = await calculateBillData(harvestData);

        const message = `Supervisor Name: ${BillData.user_name}\nDate: ${harvestData.created_date}\nFarmer name: ${BillData.farmer_name}\nVehicle weight: ${BillData.Weight}\nBoxes: ${BillData.EmptyBoxWeight}\nSubtotalWeight: ${BillData.SubtotalWeight}\nWastage: ${BillData.Wastage}\nNet Weight: ${BillData.NetWeight}\nDanda: ${BillData.Danda}\nTotalWeight: ${BillData.TotalWeight}\nRate: ${BillData.Rate}\nInitialAmount: ${BillData.InitialAmount}\nLabourTransport: ${BillData.LabourTransport}\nAmountPayable: ${BillData.AmountPayable}`;

        // Insert the bill data into the farmer_bill table
        await farmer_bill({
            supervisor_name:BillData.user_name, 
            date:harvestData.created_date, 
            vehicle_number:harvestData.vehicle_no,
            company_name:BillData.company_name,
            contractor_name:BillData.contractor_name,
            farmer_name:BillData.farmer_name, 
            farmer_mobile:harvestData.mobile_no,
            location:harvestData.location,
            weight:BillData.Weight, 
            empty_box_weight:BillData.EmptyBoxWeight, 
            subtotal_weight:BillData.SubtotalWeight, 
            wastage:BillData.Wastage, 
            net_weight:BillData.NetWeight, 
            danda:BillData.Danda, 
            total_weight:BillData.TotalWeight, 
            rate:BillData.Rate, 
            initial_amount:BillData.InitialAmount, 
            labour_transport:BillData.LabourTransport, 
            amount_payable:BillData.AmountPayable,
            main_box:harvestData.maximum_box_type
        });

        await labour_bill({
            Date:harvestData.created_date,
            LabourName:BillData.labour_name,
            LabourMobile:BillData.labour_mobile,
            VehicleNo: harvestData.vehicle_no,
            ContractorName: BillData.contractor_name,
            Location: harvestData.location,
            CompanyName:BillData.company_name,
            '3kg&5kgWeight': harvestData['3kg']*3+harvestData['3kg_*']*3+harvestData['5kg']*5+harvestData['5kg_*']*5,
            Remainingfilledboxweight: harvestData['7kg']*7+harvestData['7kg_*']*7+harvestData['13kg']*13+harvestData['13kg_*']*13+harvestData['13_5kg']*13.5+harvestData['13_5kg_*']*13.5+harvestData['14kg']*14+harvestData['14kg_*']*14+harvestData['16kg']*16+harvestData['16kg_*']*16,
            AmountPayable: ( harvestData['3kg']*3+harvestData['3kg_*']*3+harvestData['5kg']*5+harvestData['5kg_*']*5)*2+(harvestData['7kg']*7+harvestData['7kg_*']*7+harvestData['13kg']*13+harvestData['13kg_*']*13+harvestData['13_5kg']*13.5+harvestData['13_5kg_*']*13.5+harvestData['14kg']*14+harvestData['14kg_*']*14+harvestData['16kg']*16+harvestData['16kg_*']*16)*1.7,
            BoxunloadingCharges: harvestData['3kg']*0.25+harvestData['3kg_*']*0.25+harvestData['5kg']*0.5+harvestData['5kg_*']*0.5+harvestData['7kg']*0.6+harvestData['7kg_*']*0.6+harvestData['13kg']*1+harvestData['13kg_*']*1+harvestData['13_5kg']*1+harvestData['13_5kg_*']*1+harvestData['16kg']*1+harvestData['16kg_*']*1,
            '3kg': harvestData['3kg'],
            '3kg_*': harvestData['3kg_*'],
            '5kg': harvestData['5kg'],
            '5kg_*': harvestData['5kg_*'],
            '7kg': harvestData['7kg'],
            '7kg_*': harvestData['7kg_*'],
            '13kg': harvestData['13kg'],
            '13kg_*': harvestData['13kg_*'],
            '13_5kg': harvestData['13_5kg'],
            '13_5kg_*': harvestData['13_5kg_*'],
            '14kg': harvestData['14kg'],
            '14kg_*': harvestData['14kg_*'],
            '16kg': harvestData['16kg'],
            '16kg_*': harvestData['16kg_*'],
            maximum_box_type: harvestData.maximum_box_type,
            second_box_type: harvestData.second_box_type,
            third_box_type: harvestData.third_box_type,
            fourth_box_type:harvestData.fourth_box_type,
            MaximumweightbyboxMethod:  harvestData['3kg']*3.5+harvestData['3kg_*']*3.5+harvestData['5kg']*5.7+harvestData['5kg_*']*5.7+harvestData['7kg']*7.9+harvestData['7kg_*']*7.9+harvestData['13kg']*14.2+harvestData['13kg_*']*14.2+harvestData['13_5kg']*14.7+harvestData['13_5kg_*']*14.7+harvestData['16kg']*17.4+harvestData['16kg_*']*17.4,
            MorethanMax_Allowed: harvestData.weight-(harvestData['3kg']*3.5+harvestData['3kg_*']*3.5+harvestData['5kg']*5.7+harvestData['5kg_*']*5.7+harvestData['7kg']*7.9+harvestData['7kg_*']*7.9+harvestData['13kg']*14.2+harvestData['13kg_*']*14.2+harvestData['13_5kg']*14.7+harvestData['13_5kg_*']*14.7+harvestData['16kg']*17.4+harvestData['16kg_*']*17.4),
            MinimumallowedWeigth: harvestData['3kg']*3.3+harvestData['3kg_*']*3.3+harvestData['5kg']*5.5+harvestData['5kg_*']*5.5+harvestData['7kg']*7.7+harvestData['7kg_*']*7.7+harvestData['13kg']*14+harvestData['13kg_*']*14+harvestData['13_5kg']*14.5+harvestData['13_5kg_*']*14.5+harvestData['16kg']*17.2+harvestData['16kg_*']*17.2,
            LessthanminimumAllowed: harvestData.weight-(harvestData['3kg']*3.3+harvestData['3kg_*']*3.3+harvestData['5kg']*5.5+harvestData['5kg_*']*5.5+harvestData['7kg']*7.7+harvestData['7kg_*']*7.7+harvestData['13kg']*14+harvestData['13kg_*']*14+harvestData['13_5kg']*14.5+harvestData['13_5kg_*']*14.5+harvestData['16kg']*17.2+harvestData['16kg_*']*17.2),
            RecordedWeight: harvestData.weight
        });


        await company_bill({
            Date:harvestData.created_date,
            Vehicle_Number:harvestData.vehicle_no,
            Company_Name:BillData.company_name,
            LabourTeam_Name:BillData.contractor_name,
            Farmer_Name:BillData.farmer_name,
            Weight:BillData.Weight,
            EmptyBox_weight:BillData.EmptyBoxWeight,
            Subtotal_Weight:BillData.SubtotalWeight,
            Wastage:harvestData.company_wastage,
            Net_Weight:BillData.SubtotalWeight+harvestData.company_wastage,
            Danda:(BillData.SubtotalWeight+harvestData.company_wastage)*0.08, 
            Total_Weight:((BillData.SubtotalWeight+harvestData.company_wastage)*0.08)+(BillData.SubtotalWeight+harvestData.company_wastage),
            Rate:harvestData.company_rate, 
            Initial_Amount:(((BillData.SubtotalWeight+harvestData.company_wastage)*0.08)+(BillData.SubtotalWeight+harvestData.company_wastage))*harvestData.company_rate,
            Labour_Transport:(((BillData.SubtotalWeight+harvestData.company_wastage)*0.08)+(BillData.SubtotalWeight+harvestData.company_wastage))*0, 
            Amount_Payable:((((BillData.SubtotalWeight+harvestData.company_wastage)*0.08)+(BillData.SubtotalWeight+harvestData.company_wastage))*harvestData.company_rate)-((((BillData.SubtotalWeight+harvestData.company_wastage)*0.08)+(BillData.SubtotalWeight+harvestData.company_wastage))*0),
            

        })
        //Send message
       // sendMessage(harvestData.mobile_no, message);

        // Respond with success message
        response.status(200).send('Harvest data inserted and farmer details retrieved successfully' + "\n" + message);
    } catch (error) {
        response.status(500).send('Error processing request');
        console.error('Error processing request:', error);
    }
});


function fetchFarmerName(mobile_no) {
    return new Promise((resolve, reject) => {
        db.pool.query(
            'SELECT * FROM farmer WHERE mobile_no = ?',
            [mobile_no],
            (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length === 0) {
                    return reject(new Error('Farmer not found'));
                }
                resolve(results[0].farmer_name);
            }
        );
    });
}

function fetchUserName(user_id) {
    return new Promise((resolve, reject) => {
        db.pool.query(
            'SELECT * FROM user WHERE user_id = ?',
            [user_id],
            (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length === 0) {
                    return reject(new Error('User not found'));
                }
                resolve(results[0].user_name);
            }
        );
    });
}

function fetchCompanyName(company_id) {
    return new Promise((resolve, reject) => {
        db.pool.query(
            'SELECT * FROM company WHERE company_id = ?',
            [company_id],
            (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length === 0) {
                    return reject(new Error('company not found'));
                }
                resolve(results[0].company_name );
            }
        );
    });
}

function fetchLabourTeamName(labour_id) {
    return new Promise((resolve, reject) => {
        db.pool.query(
            'SELECT * FROM labour WHERE labour_id = ?',
            [labour_id],
            (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length === 0) {
                    return reject(new Error('labourteam not found'));
                }
                const result = {
                    contractor_name: results[0].contractor_name,
                    labour_name: results[0].labour_name,
                    labour_mobile: results[0].labour_mobile
                };
                resolve(result);
            }
        );
    });
}

async function calculateBillData(harvestData) {
    try {
        const [farmer_name, user_name,company_name,labourTeam] = await Promise.all([
            fetchFarmerName(harvestData.mobile_no),
            fetchUserName(harvestData.user_id),
            fetchCompanyName(harvestData.company_id),
            fetchLabourTeamName(harvestData.labour_id)
        ]);

        const Weight = harvestData.weight;
        const EmptyBoxWeight = (harvestData[`3kg`] * 0.3 + harvestData[`3kg_*`] * 0.3 + harvestData[`5kg`] * 0.5 + harvestData[`5kg_*`] * 0.5 + harvestData[`7kg`] * 0.7 + harvestData[`7kg_*`] * 0.7 + harvestData[`13kg`] * 1 + harvestData[`13kg_*`] * 1 + harvestData[`13_5kg`] * 1 + harvestData[`13_5kg_*`] * 1 + harvestData[`14kg`] * 1 + harvestData[`14kg_*`] * 1 + harvestData[`16kg`] * 1.2 + harvestData[`16kg_*`] * 1.2);
        const SubtotalWeight = Weight - EmptyBoxWeight;
        const Wastage = harvestData.wastage;
        const NetWeight = SubtotalWeight + Wastage;
        const Danda = NetWeight * 8 / 100;
        const TotalWeight = NetWeight + Danda;
        const Rate = harvestData.rate;
        const InitialAmount = TotalWeight * Rate;
        const LabourTransport = TotalWeight * 0.4;
        const AmountPayable = InitialAmount - LabourTransport;

        return {
            Weight,
            EmptyBoxWeight,
            SubtotalWeight,
            Wastage,
            NetWeight,
            Danda,
            TotalWeight,
            Rate,
            InitialAmount,
            LabourTransport,
            AmountPayable,
            user_name,
            farmer_name,
            company_name,
            contractor_name: labourTeam.contractor_name,
            labour_name: labourTeam.labour_name,
            labour_mobile: labourTeam.labour_mobile
        };
    } catch (error) {
        console.error('Error calculating bill data:', error);
        throw error;
    }
}


function sendMessage(to, message) {
    // Your code to send message, e.g., using Twilio
    client.messages
        .create({
            body: message,
            from: twilioPhoneNo,
            to: to
        })
        .then(message => console.log(`Message sent to ${to}: ${message.sid}`))
        .catch(error => console.error(`Error sending message to ${to}: ${error}`));

}


//function addFarmerBill()
function farmer_bill(billData) {
    return new Promise((resolve, reject) => {
        const statement = `
        INSERT INTO farmer_bill (
            Supervisor_Name,
            Date,
            Vehicle_Number,
            Company_Name,
            LabourTeam_Name,
            Farmer_Name,
            farmer_mobile,
            Weight,
            EmptyBox_weight,
            Subtotal_Weight,
            Wastage,
            Net_Weight,
            Danda,
            Total_Weight,
            Rate,
            Initial_Amount,
            Labour_Transport,
            Amount_Payable,
            Main_Box
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)
    `;

        const values = [
            billData.supervisor_name, 
            billData.date, 
            billData.vehicle_number,
            billData.company_name,
            billData.contractor_name,
            billData.farmer_name,
            billData.farmer_mobile, 
            billData.weight, 
            billData.empty_box_weight, 
            billData.subtotal_weight, 
            billData.wastage, 
            billData.net_weight, 
            billData.danda, 
            billData.total_weight, 
            billData.rate, 
            billData.initial_amount, 
            billData.labour_transport, 
            billData.amount_payable,
            billData.main_box
        ];
        db.pool.query(statement, values, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}

//function to add labour bill
async function labour_bill(labourBillData) {
    const statement = `
        INSERT INTO labour_bill 
        (Date, LabourName, LabourMobile, VehicleNo, ContractorName, Location, CompanyName, 
         \`3kg&5kgWeight\`, Remainingfilledboxweight, AmountPayable, BoxunloadingCharges, 
         \`3kg\`, \`3kg_*\`, \`5kg\`, \`5kg_*\`, \`7kg\`, \`7kg_*\`, 
         \`13kg\`, \`13kg_*\`, \`13_5kg\`, \`13_5kg_*\`, 
         \`14kg\`, \`14kg_*\`, \`16kg\`, \`16kg_*\`, 
         maximum_box_type, second_box_type, third_box_type, fourth_box_type, 
         MaximumweightbyboxMethod, MorethanMax_Allowed, MinimumallowedWeigth, 
         LessthanminimumAllowed, RecordedWeight) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        labourBillData.Date,
        labourBillData.LabourName,
        labourBillData.LabourMobile,
        labourBillData.VehicleNo,
        labourBillData.ContractorName,
        labourBillData.Location,
        labourBillData.CompanyName,
        labourBillData['3kg&5kgWeight'],
        labourBillData.Remainingfilledboxweight,
        labourBillData.AmountPayable,
        labourBillData.BoxunloadingCharges,
        labourBillData['3kg'],
        labourBillData['3kg_*'],
        labourBillData['5kg'],
        labourBillData['5kg_*'],
        labourBillData['7kg'],
        labourBillData['7kg_*'],
        labourBillData['13kg'],
        labourBillData['13kg_*'],
        labourBillData['13_5kg'],
        labourBillData['13_5kg_*'],
        labourBillData['14kg'],
        labourBillData['14kg_*'],
        labourBillData['16kg'],
        labourBillData['16kg_*'],
        labourBillData.maximum_box_type,
        labourBillData.second_box_type,
        labourBillData.third_box_type,
        labourBillData.fourth_box_type,
        labourBillData.MaximumweightbyboxMethod,
        labourBillData.MorethanMax_Allowed,
        labourBillData.MinimumallowedWeigth,
        labourBillData.LessthanminimumAllowed,
        labourBillData.RecordedWeight
    ];

    return new Promise((resolve, reject) => {
        db.pool.query(statement, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}





async function company_bill(companyBillData) {
    
    const statement = `
        INSERT INTO company_bill (
            Date,
            Vehicle_Number,
            Company_Name,
            LabourTeam_Name,
            Farmer_Name,
            Weight,
            EmptyBox_weight,
            Subtotal_Weight,
            Wastage,
            Net_Weight,
            Danda,
            Total_Weight,
            Rate,
            Initial_Amount,
            Labour_Transport,
            Amount_Payable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        companyBillData.Date,
        companyBillData.Vehicle_Number,
        companyBillData.Company_Name,
        companyBillData.LabourTeam_Name,
        companyBillData.Farmer_Name,
        companyBillData.Weight,
        companyBillData.EmptyBox_weight,
        companyBillData.Subtotal_Weight,
        companyBillData.Wastage,
        companyBillData.Net_Weight,
        companyBillData.Danda,
        companyBillData.Total_Weight,
        companyBillData.Rate,
        companyBillData.Initial_Amount,
        companyBillData.Labour_Transport,
        companyBillData.Amount_Payable
    ];

    return new Promise((resolve, reject) => {
        db.pool.query(statement, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
} return router;
};

module.exports = createUserRouter;


