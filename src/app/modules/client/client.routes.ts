import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { ClientController } from './client.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();


router.get("/get-all-clients", ClientController.getAllClients);
router.get("/get-client-agent", ClientController.getClientAgent);
// =Client Site=======================================
router.get("/upcoming-appointment",
    auth(ENUM_USER_ROLE.CLIENT,
        ENUM_USER_ROLE.AGENT,
    ), ClientController.getUpcomingAppointment);
router.get("/recent-deliver-order",
    ClientController.getRecentDeliverOrder);
router.get("/get-all-orders",
    auth(ENUM_USER_ROLE.CLIENT,
        ENUM_USER_ROLE.AGENT,
    ), ClientController.getClientOrder);

router.get("/clients-invoice",
    ClientController.getAllClientsWithOrder);




export const ClientRoutes = router;
