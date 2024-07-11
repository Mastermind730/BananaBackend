-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS harvest;

-- Use the created database
USE harvest;

-- Create the user table
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    mobile_no VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(300) NOT NULL,
    created_on TIMESTAMP DEFAULT NOW()
);

-- Create the farmer table
CREATE TABLE IF NOT EXISTS farmer (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(10) UNIQUE NOT NULL,
    location VARCHAR(50) NOT NULL,
    created_on TIMESTAMP DEFAULT NOW()
);

-- Create the company table
CREATE TABLE IF NOT EXISTS company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL,
    company_address VARCHAR(100),
    company_email VARCHAR(30) UNIQUE NOT NULL,
    owner_name VARCHAR(50) UNIQUE NOT NULL,
    owner_mobile VARCHAR(10) UNIQUE NOT NULL,
    payment_relatedperson VARCHAR(50) NOT NULL,
    payment_relatedpersoncontact VARCHAR(10) UNIQUE NOT NULL,
    GSTIN VARCHAR(15) UNIQUE NOT NULL,
    created_on TIMESTAMP DEFAULT NOW()
);

-- Create the labour table
CREATE TABLE IF NOT EXISTS labour (
    labour_id INT AUTO_INCREMENT PRIMARY KEY,
    labour_name VARCHAR(100)  NOT NULL,
    labour_mobile VARCHAR(10) UNIQUE NOT NULL,
    contractor_name VARCHAR(30)  NOT NULL,
    contractor_mobile VARCHAR(10) UNIQUE NOT NULL,
    created_on TIMESTAMP DEFAULT NOW()
);

-- Create the harvest_data table
CREATE TABLE IF NOT EXISTS harvest_data (
    harvest_id INT AUTO_INCREMENT PRIMARY KEY,
    created_date DATE NOT NULL,
    vehicle_no VARCHAR(10) NOT NULL,
    user_id INT NOT NULL,
    labour_id INT NOT NULL,
    company_id INT NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    location VARCHAR(100) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    wastage DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    company_rate DECIMAL(10,2) DEFAULT 0,
    company_wastage DECIMAL(10,2) DEFAULT 0,
    `3kg` DECIMAL(10,2) DEFAULT 0,
    `3kg_*` DECIMAL(10,2) DEFAULT 0,
    `5kg` DECIMAL(10,2) DEFAULT 0,
    `5kg_*` DECIMAL(10,2) DEFAULT 0,
    `7kg` DECIMAL(10,2) DEFAULT 0,
    `7kg_*` DECIMAL(10,2) DEFAULT 0,
    `13kg` DECIMAL(10,2) DEFAULT 0,
    `13kg_*` DECIMAL(10,2) DEFAULT 0,
    `13_5kg` DECIMAL(10,2) DEFAULT 0,
    `13_5kg_*` DECIMAL(10,2) DEFAULT 0,
    `14kg` DECIMAL(10,2) DEFAULT 0,
    `14kg_*` DECIMAL(10,2) DEFAULT 0,
    `16kg` DECIMAL(10,2) DEFAULT 0,
    `16kg_*` DECIMAL(10,2) DEFAULT 0,
    maximum_box_type VARCHAR(10) NOT NULL,
    second_box_type VARCHAR(10),
    third_box_type VARCHAR(10),
    fourth_box_type VARCHAR(10),
    `4H` DECIMAL(10,2) DEFAULT 0,
    `5H` DECIMAL(10,2) DEFAULT 0,
    `6H` DECIMAL(10,2) DEFAULT 0,
    `7H` DECIMAL(10,2) DEFAULT 0,
    `8H` DECIMAL(10,2) DEFAULT 0,
    `9H` DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (labour_id) REFERENCES labour(labour_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (mobile_no) REFERENCES farmer(mobile_no) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the farmer_bill table
CREATE TABLE IF NOT EXISTS farmer_bill (
    farmer_bill_id INT AUTO_INCREMENT PRIMARY KEY,
    Supervisor_Name VARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    Vehicle_Number VARCHAR(10) NOT NULL,
    Company_Name VARCHAR(30) NOT NULL,
    LabourTeam_Name VARCHAR(30) NOT NULL,
    Farmer_Name VARCHAR(100) NOT NULL,
	farmer_mobile VARCHAR(10) NOT NULL,
    Weight DECIMAL(10,2) NOT NULL,
    EmptyBox_weight DECIMAL(10,2) NOT NULL,
    Subtotal_Weight DECIMAL(10,2) NOT NULL,
    Wastage DECIMAL(10,2) NOT NULL,
    Net_Weight DECIMAL(10,2) NOT NULL,
    Danda DECIMAL(10,2) NOT NULL,
    Total_Weight DECIMAL(10,2) NOT NULL,
    Rate DECIMAL(10,2) NOT NULL,
    Initial_Amount DECIMAL(10,2) NOT NULL,
    Labour_Transport DECIMAL(10,2) NOT NULL,
    Amount_Payable DECIMAL(10,2) NOT NULL,
    Main_Box VARCHAR(10) NOT NULL
);

-- Create the labour_bill table
CREATE TABLE IF NOT EXISTS labour_bill (
    labour_bill_id INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE NOT NULL,
	LabourName VARCHAR(100) NOT NULL,
	LabourMobile VARCHAR(10) NOT NULL,
    VehicleNo VARCHAR(50) NOT NULL,
	CompanyName VARCHAR(100) NOT NULL,
    ContractorName VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    `3kg&5kgWeight` DECIMAL(10,2) DEFAULT 0,
    Remainingfilledboxweight DECIMAL(10,2) NOT NULL,
    AmountPayable DECIMAL(10,2) NOT NULL,
    BoxunloadingCharges DECIMAL(10,2) NOT NULL,
    `3kg` DECIMAL(10,2) DEFAULT 0,
    `3kg_*` DECIMAL(10,2) DEFAULT 0,
    `5kg` DECIMAL(10,2) DEFAULT 0,
    `5kg_*` DECIMAL(10,2) DEFAULT 0,
    `7kg` DECIMAL(10,2) DEFAULT 0,
    `7kg_*` DECIMAL(10,2) DEFAULT 0,
    `13kg` DECIMAL(10,2) DEFAULT 0,
    `13kg_*` DECIMAL(10,2) DEFAULT 0,
    `13_5kg` DECIMAL(10,2) DEFAULT 0,
    `13_5kg_*` DECIMAL(10,2) DEFAULT 0,
    `14kg` DECIMAL(10,2) DEFAULT 0,
    `14kg_*` DECIMAL(10,2) DEFAULT 0,
    `16kg` DECIMAL(10,2) DEFAULT 0,
    `16kg_*` DECIMAL(10,2) DEFAULT 0,
    maximum_box_type VARCHAR(10) NOT NULL,
    second_box_type VARCHAR(10),
    third_box_type VARCHAR(10),
	fourth_box_type VARCHAR(10),
    MaximumweightbyboxMethod DECIMAL(10,2) DEFAULT 0,
    MorethanMax_Allowed DECIMAL(10,2) DEFAULT 0,
    MinimumallowedWeigth DECIMAL(10,2) DEFAULT 0,
    LessthanminimumAllowed DECIMAL(10,2) DEFAULT 0,
    RecordedWeight DECIMAL(10,2) DEFAULT 0
);

-- Create the company_bill table
CREATE TABLE IF NOT EXISTS company_bill (
    company_bill_id INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE NOT NULL,
    Vehicle_Number VARCHAR(10) NOT NULL,
    Company_Name VARCHAR(30)  NOT NULL,
    LabourTeam_Name VARCHAR(30)  NOT NULL,
    Farmer_Name VARCHAR(100) NOT NULL,
    Weight DECIMAL(10,2) NOT NULL,
    EmptyBox_weight DECIMAL(10,2) NOT NULL,
    Subtotal_Weight DECIMAL(10,2) NOT NULL,
    Wastage DECIMAL(10,2) NOT NULL,
    Net_Weight DECIMAL(10,2) NOT NULL,
    Danda DECIMAL(10,2) NOT NULL,
    Total_Weight DECIMAL(10,2) NOT NULL,
    Rate DECIMAL(10,2) NOT NULL,
    Initial_Amount DECIMAL(10,2) NOT NULL,
    Labour_Transport DECIMAL(10,2) NOT NULL,
    Amount_Payable DECIMAL(10,2) NOT NULL
);
