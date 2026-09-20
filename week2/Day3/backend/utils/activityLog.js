const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

const logActivity = async (taskId, userId, action, previousValue = null, newValue = null) => {
  await Activity.create({
    task: taskId,
    user: userId,
    action,
    previousValue: previousValue !== null ? String(previousValue) : null,
    newValue: newValue !== null ? String(newValue) : null,
  });
};

const notify = async (recipientId, actorId, type, message, taskId = null) => {
  if (!recipientId || recipientId.toString() === actorId.toString()) return;
  await Notification.create({
    recipient: recipientId,
    type,
    message,
    task: taskId,
  });
};

module.exports = { logActivity, notify };
