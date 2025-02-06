import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { OrdersController } from './order.controller';

const router = express.Router();

router.post("/create-order", uploadC.array('uploadFiles'), OrdersController.createNewOrder);






export const OrderRoutes = router;
