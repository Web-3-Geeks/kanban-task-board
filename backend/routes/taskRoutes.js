const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getTasks, createTask } = require("../controllers/taskController");

router.get("/", protect, getTasks);
router.post("/", protect, createTask);

module.exports = router;