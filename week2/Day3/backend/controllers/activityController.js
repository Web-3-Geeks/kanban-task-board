const Activity = require("../models/Activity");
const Task = require("../models/Task");
const { isOwnerOrAssignee } = require("./taskController");

const getActivity = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !isOwnerOrAssignee(task, req.user.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const activity = await Activity.find({ task: task._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getActivity };
