import { Notification } from '../models/index.js';

export const createNotification = async ({
  userId = null,
  departmentCode = null,
  role = null,
  title,
  message,
  type = 'info', // 'info', 'warning', 'success', 'urgent'
  caseId = null,
  taskId = null
}) => {
  try {
    const notif = await Notification.create({
      userId,
      departmentCode,
      role,
      title,
      message,
      type,
      caseId,
      taskId,
      read: false,
      createdAt: new Date().toISOString()
    });
    return notif;
  } catch (err) {
    console.error('[NOTIFICATION ERROR]', err);
  }
};

export const getNotificationsForUser = async (user) => {
  const query = {
    $or: [
      { userId: user.id || user._id },
      { role: user.role }
    ]
  };
  if (user.departmentCode) {
    query.$or.push({ departmentCode: user.departmentCode });
  }
  const notifs = await Notification.find(query);
  return notifs.sort({ createdAt: -1 });
};

export default { createNotification, getNotificationsForUser };
