const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        if (!title ||  !title.trim()) {
            return res.status(400).json({ message: "Title is required" })
        }

        const validStatuses = ["todo", "in-progress", "done"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const validPriorities = ["low", "medium", "high"];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority value"})
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            owner: req.user.id
        });

        res.status(201).json(task)
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.owner.toString() !== req.user.id) {
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

        if (!task || task.owner.toString() !== req.user.id) {
            return res.status(404).json({ message: "Task not found" });
        }

        const validStatuses = ["todo", "in-progress", "done"];
        if (req.body.status && !validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: "Invalid status value"});
        }

        const validPriorities = ["low", "medium", "high"];
        if (req.body.priority && !validPriorities.includes(req.body.priority)) {
            return res.status(400).json({ message: "Invalid priority value" });
        }

        const { title, description, status, priority, dueDate } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;

        await task.save();

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.owner.toString() !== req.user.id) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();

        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {getTasks, createTask, getTaskById, updateTask, deleteTask };
