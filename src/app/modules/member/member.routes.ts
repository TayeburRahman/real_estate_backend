import express from 'express';
import uploadC from '../../middlewares/cloudinaryUpload';
import { MemberController } from './member.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();


router.get("/get-all-member", MemberController.getAllMembersWithOutPagination);
router.get("/get-team-member", MemberController.getAllMembers);




// router.patch("/get-all", ClientController.getAllTasks);




export const MemberRoutes = router;
