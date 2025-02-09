const express = require("express");
const { getSupplierAnswer } = require("../controllers/supplierController");

const router = express.Router();

router.post("/query", getSupplierAnswer);

module.exports = router;
