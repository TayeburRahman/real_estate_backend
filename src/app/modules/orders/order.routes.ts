import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { OrdersController } from './order.controller';

const router = express.Router();

router.post("/create-order", uploadC.array('uploadFiles'), OrdersController.createNewOrder);
router.patch("/update-order/:orderId", uploadC.array('uploadFiles'), OrdersController.updateOrder);
router.patch("/edit-order-service/:orderId", OrdersController.editServicesOfOrder);



export const OrderRoutes = router;
