const express = require("express");
const router = express.Router();
const {register_controler, login_controler, logout_controler, refresh_token_controler} = require("../controllers/auth");

router.post("/auth/register", register_controler);

router.post("/auth/login", login_controler);

router.get("/auth/refresh_log",  refresh_token_controler);

router.delete("/auth/logout", logout_controler);


module.exports = router;