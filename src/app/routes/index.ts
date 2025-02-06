import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { MessageRoutes } from '../modules/messages/message.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { OrderRoutes } from '../modules/orders/order.routes';

const router = express.Router();

const moduleRoutes = [
  // -- done
  {
    path: '/auth',
    route: AuthRoutes,
  },
  // -- done
  {
    path: '/message',
    route: MessageRoutes,
  },
  // -- progressing
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/service',
    route: ServiceRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },


];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
