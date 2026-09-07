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
        const { title, description, status, priority } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" })
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            owner: req.user.id
        });

        res.status(201).json(task)
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {getTasks, createTask };
