import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { MessageRoutes } from '../modules/messages/message.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { OrderRoutes } from '../modules/orders/order.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { ClientRoutes } from '../modules/client/client.routes';
import { MemberRoutes } from '../modules/member/member.routes';
import { ReportRoutes } from '../modules/report/report.routes';
import { InvoiceRoutes } from '../modules/invoice/invoice.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/client',
    route: ClientRoutes,
  },
  {
    path: '/member',
    route: MemberRoutes,
  },
  {
    path: '/report',
    route: ReportRoutes,
  },
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
  {
    path: '/task',
    route: TaskRoutes,
  },
  {
    path: '/invoice',
    route: InvoiceRoutes,
  }

];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
