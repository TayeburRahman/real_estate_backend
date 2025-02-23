
import express from 'express';
import { InvoiceController } from './invoice.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post('/create-order-invoice', InvoiceController.createOrderInvoice);
router.get('/get-client-invoice', InvoiceController.getClientOrderInvoice);
router.post('/create-checkout-session',
    auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    InvoiceController.createCheckoutSessionStripe);
router.post('/stripe-webhooks',
    auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    InvoiceController.stripeCheckAndUpdateStatusSuccess);



export const InvoiceRoutes = router;
