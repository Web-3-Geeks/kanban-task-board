const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getTasks, createTask, getTaskById, updateTask, deleteTask } = require("../controllers/taskController");
const { getComments, createComment } = require("../controllers/commentController");
const { getActivity } = require("../controllers/activityController");

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

router.get("/:id/comments", protect, getComments);
router.post("/:id/comments", protect, createComment);

router.get("/:id/activity", protect, getActivity);

module.exports = router;
