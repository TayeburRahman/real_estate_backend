
import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ReportController } from './report.controller';

const router = express.Router();

router.get('/order-par-services', ReportController.getOrderServices);
router.get('/order-par-packages', ReportController.getOrderPackages);
router.get('/order-client-report', ReportController.getOrderClientReports);
router.get('/team-member-report', ReportController.getTeamMemberReports);

export const ReportRoutes = router;
