const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity, notify } = require("../utils/activityLog");

const VALID_STATUSES = ["todo", "in-progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

const idOf = (field) => {
  if (!field) return null;
  return (field._id ?? field).toString();
};

const isOwner = (task, userId) => idOf(task.owner) === userId;
const isOwnerOrAssignee = (task, userId) =>
  isOwner(task, userId) || idOf(task.assignedTo) === userId;

const getOtherParty = (task, actorId) => {
  const ownerId = idOf(task.owner);
  const assigneeId = idOf(task.assignedTo);
  if (actorId === ownerId) return assigneeId;
  if (actorId === assigneeId) return ownerId;
  return null;
};

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

    await logActivity(task._id, req.user.id, "created", null, title);

    if (assignedTo) {
      await notify(
        assignedTo,
        req.user.id,
        "assigned",
        `You were assigned to "${title}"`,
        task._id
      );
    }

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
    const changes = [];
    const otherPartyBefore = getOtherParty(task, req.user.id);

    if (status !== undefined && status !== task.status) {
      changes.push({ action: "status changed", prev: task.status, next: status });
      task.status = status;
    }
    if (priority !== undefined && priority !== task.priority) {
      changes.push({ action: "priority changed", prev: task.priority, next: priority });
      task.priority = priority;
    }
    if (dueDate !== undefined && String(dueDate) !== String(task.dueDate)) {
      changes.push({
        action: "due date changed",
        prev: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "none",
        next: dueDate ? new Date(dueDate).toISOString().slice(0, 10) : "none",
      });
      task.dueDate = dueDate;
    }
    if (assignedTo !== undefined) {
      const newAssignee = assignedTo || null;
      const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;
      if (newAssignee !== oldAssignee) {
        const [prevUser, nextUser] = await Promise.all([
          oldAssignee ? User.findById(oldAssignee) : null,
          newAssignee ? User.findById(newAssignee) : null,
        ]);
        changes.push({
          action: "assigned",
          prev: prevUser?.name ?? "unassigned",
          next: nextUser?.name ?? "unassigned",
        });
        task.assignedTo = newAssignee;
        if (newAssignee) {
          await notify(
            newAssignee,
            req.user.id,
            "assigned",
            `You were assigned to "${task.title}"`,
            task._id
          );
        }
      }
    }
    if (title !== undefined && title !== task.title) task.title = title;
    if (description !== undefined && description !== task.description) {
      task.description = description;
    }

    if (changes.length === 0 && (title !== undefined || description !== undefined)) {
      changes.push({ action: "updated", prev: null, next: null });
    }

    await task.save();

    for (const change of changes) {
      await logActivity(task._id, req.user.id, change.action, change.prev, change.next);
    }

    const statusOrPriorityOrDueChanged = changes.some((c) =>
      ["status changed", "priority changed", "due date changed", "updated"].includes(c.action)
    );
    if (statusOrPriorityOrDueChanged && otherPartyBefore) {
      await notify(
        otherPartyBefore,
        req.user.id,
        "task-updated",
        `"${task.title}" was updated`,
        task._id
      );
    }

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

    await logActivity(task._id, req.user.id, "deleted", task.title, null);
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
  getOtherParty,
};
