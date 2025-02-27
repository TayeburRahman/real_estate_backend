import express from 'express';
import { NotificationController } from './notifications.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
  '/get-admin-notifications',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.SUPER_ADMIN),
  NotificationController.getAdminNotifications
);
router.get(
  '/get-client-notifications',
  auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT),
  NotificationController.clientNotification
);
router.patch(
  '/seen-notification',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.MEMBER),
  NotificationController.seenNotifications
);
router.patch(
  '/update-notification/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  NotificationController.updateNotification
);
router.delete(
  '/delete/:id',
  NotificationController.deleteNotifications
);

export const NotificationRoutes = router;
