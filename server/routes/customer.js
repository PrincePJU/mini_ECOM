const express = require("express");
const router = express.Router();

const {checkForAuthentication} = require('../middlewares/auth')

const { restrictTo } = require("../middlewares/auth");

const {
  handleAddOrder,
  handleGetCustomerOrders,
  handleUpdateCustomerOrder,
} = require("../controllers/order");

//Manage orders
router.route("/order")
  .all(checkForAuthentication)
    .post(handleAddOrder)
    .get(handleGetCustomerOrders)
    .patch(handleUpdateCustomerOrder);

router    
module.exports = router;