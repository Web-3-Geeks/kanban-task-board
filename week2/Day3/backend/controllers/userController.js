const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email").sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers };
