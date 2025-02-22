
import express from 'express';
import { InvoiceController } from './invoice.controller';

const router = express.Router();

router.post('/create-order-invoice', InvoiceController.createOrderInvoice);
router.post('/get-client-invoice', InvoiceController.getClientOrderInvoice);


export const InvoiceRoutes = router;
