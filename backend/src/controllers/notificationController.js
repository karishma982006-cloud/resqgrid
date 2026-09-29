import { Notification } from '../models/index.js';
import { getNotificationsForUser } from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotificationsForUser(req.user);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      const userQuery = {
        $or: [
          { userId: req.user.id },
          { role: req.user.role }
        ]
      };
      if (req.user.departmentCode) userQuery.$or.push({ departmentCode: req.user.departmentCode });
      await Notification.updateMany(userQuery, { read: true });
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    const updated = await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true, notification: updated });
  } catch (err) {
    next(err);
  }
};

export default { getNotifications, markAsRead };
