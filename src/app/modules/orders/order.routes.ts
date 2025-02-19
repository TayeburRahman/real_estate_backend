
import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { OrdersController } from './order.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get('/', OrdersController.getAllOrders);
router.post("/create-order", uploadC.array('uploadFiles'),
    auth(
        ENUM_USER_ROLE.CLIENT,
        ENUM_USER_ROLE.MEMBER,
        ENUM_USER_ROLE.AGENT,
        ENUM_USER_ROLE.ADMIN,
        ENUM_USER_ROLE.SUPER_ADMIN
    )
    , OrdersController.createNewOrder);
router.patch("/update-order/:orderId", uploadC.array('uploadFiles'), OrdersController.updateOrder);
router.patch("/edit-order-service/:orderId", OrdersController.editServicesOfOrder);
router.patch("/set-scheduled-time/:orderId", OrdersController.setScheduledTime);
router.delete("/delete/:orderId", OrdersController.deleteOrder);
router.get("/services-packages", OrdersController.getOrderServices);
router.patch("/add-notes/:orderId",
    auth(
        ENUM_USER_ROLE.CLIENT,
        ENUM_USER_ROLE.MEMBER,
        ENUM_USER_ROLE.AGENT,
        ENUM_USER_ROLE.ADMIN,
        ENUM_USER_ROLE.SUPER_ADMIN
    ), OrdersController.addOrderNotes);
router.get("/get/:orderId", OrdersController.getSignalOrder);


export const OrderRoutes = router;