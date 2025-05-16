const express = require("express");
const router = express.Router();
const cashflowController = require("../controllers/cashflow");

router.post("/cashflow", cashflowController.addCashflow);
router.get("/cashflow/summary", cashflowController.getSalesSummary);

module.exports = router;
