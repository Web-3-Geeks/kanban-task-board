const Comment = require("../models/Comment");
const Task = require("../models/Task");
const { isOwnerOrAssignee, getOtherParty } = require("./taskController");
const { logActivity, notify } = require("../utils/activityLog");

const getComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !isOwnerOrAssignee(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = await Comment.find({ task: task._id })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !isOwnerOrAssignee(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await Comment.create({
      task: task._id,
      author: req.user.id,
      content: content.trim(),
    });

    await logActivity(task._id, req.user.id, "comment added", null, content.trim());

    const otherParty = getOtherParty(task, req.user.id);
    if (otherParty) {
      await notify(
        otherParty,
        req.user.id,
        "comment",
        `New comment on "${task.title}"`,
        task._id
      );
    }

    const populated = await comment.populate("author", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.author.toString() !== req.user.id) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    comment.content = content.trim();
    await comment.save();

    const populated = await comment.populate("author", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.author.toString() !== req.user.id) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
