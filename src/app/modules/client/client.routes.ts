import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { ClientController } from './client.controller';

const router = express.Router();


router.get("/get-all-clients", ClientController.getAllClients);
router.get("/get-client-agent", ClientController.getClientAgent);


// router.patch("/get-all", ClientController.getAllTasks);




export const ClientRoutes = router;
