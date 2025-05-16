const express = require("express");
const router = express.Router();
const xenditController = require("../controllers/xendit");

router.post("/xendit/create-invoice", xenditController.createInvoice);

module.exports = router;
