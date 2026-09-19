const Task = require("../models/Task");
const User = require("../models/User");

const VALID_STATUSES = ["todo", "in-progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

const isOwner = (task, userId) => task.owner.toString() === userId;
const isOwnerOrAssignee = (task, userId) =>
  isOwner(task, userId) || (task.assignedTo && task.assignedTo.toString() === userId);

const validateAssignee = async (assignedTo) => {
  if (!assignedTo) return true;
  const user = await User.findById(assignedTo);
  return !!user;
};

const getTasks = async (req, res) => {
  try {
    const { assignedTo, priority, status, search, dueFrom, dueTo } = req.query;

    const query = {
      $or: [{ owner: req.user.id }, { assignedTo: req.user.id }],
    };

    if (assignedTo) {
      query.assignedTo = assignedTo === "me" ? req.user.id : assignedTo;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: "Invalid priority filter" });
      }
      query.priority = priority;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$and = [{ $or: [{ title: regex }, { description: regex }] }];
    }

    if (dueFrom || dueTo) {
      query.dueDate = {};
      if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
      if (dueTo) query.dueDate.$lte = new Date(dueTo);
    }

    const tasks = await Task.find(query)
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    if (assignedTo && !(await validateAssignee(assignedTo))) {
      return res.status(400).json({ message: "Assigned user does not exist" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      owner: req.user.id,
    });

    const populated = await task.populate([
      { path: "owner", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("owner", "name email")
      .populate("assignedTo", "name email");

    if (!task || !isOwnerOrAssignee(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || !isOwnerOrAssignee(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (req.body.priority && !VALID_PRIORITIES.includes(req.body.priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    if (req.body.assignedTo !== undefined && req.body.assignedTo !== null) {
      if (!(await validateAssignee(req.body.assignedTo))) {
        return res.status(400).json({ message: "Assigned user does not exist" });
      }
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;

    await task.save();

    const populated = await task.populate([
      { path: "owner", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || !isOwner(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  isOwner,
  isOwnerOrAssignee,
};
