const express = require("express");
const router = express.Router();
const controler = require("../controllers/controler");
const authoiseToken = require("../middlewares/authorization");

router.get("/api/companies", authoiseToken, controler.homevw);

router.get("/api/getAgencies", authoiseToken, controler.getAgency);

router.post("/api/registerAgency", authoiseToken, controler.agency_contrroler);

router.post("/api/getFloatbalance", authoiseToken, controler.getFloatBalance);

router.post("/api/getCashbalance", authoiseToken, controler.getCashBalance);

router.post("/api/open_floatbusiness", authoiseToken, controler.open_Floatbusiness_controler);

router.post("/api/open_cashbusiness", authoiseToken, controler.open_Cashbusiness_controler);

router.post("/api/gettransactions", authoiseToken, controler.getDayTransactions);

router.post("/api/transactions", authoiseToken, controler.transactions_controler);

router.post("/api/close_businessDayFloat", authoiseToken, controler.close_business_controler);

router.post("/api/close_businessDayCash", authoiseToken, controler.close_business_cash);


module.exports = router;