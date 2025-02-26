import express from 'express';
import { TaskController } from './task.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import uploadC from '../../middlewares/cloudinaryUpload';

const router = express.Router();

router.get("/get-all",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.getAllTasks);
router.patch("/assign-team-member",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.assignTeamMember);
router.patch("/taken/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.takenTaskOfTeamMember);
router.get("/taken/assigned-list",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.getAllAssigned);
router.patch("/update-status/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.completeTaskUpdateStatus);
router.patch("/reject/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.rejectTask);
router.get("/view-details/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.viewTaskDetails);
router.patch("/add-source-file/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    uploadC.array('sourceFile'),
    TaskController.addSourceFileOfTask);
router.patch("/delete-file/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.deleteTaskFiles);
router.patch("/add-finished-file/:taskId",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    uploadC.array('finishFile'),
    TaskController.addFinishFileOfTask);
router.get("/get-new-task",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.getNewTasks);
router.patch("/update-status-submitted",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.taskStatusUpdateSubmitted);

// =========
router.patch("/add-comment",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.addCommentOfTaskFiles);
router.get("/get-comment",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.getCommentOfTaskFiles);
router.patch("/update-status",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.updateStatusTask);
// =============
router.patch("/revisions",
    auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.revisionsRequestTask);
router.get("/view-details-client/:taskId",
    auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.viewTaskDetailsClient);
// Dashboard Home=========================
router.get("/get-count-of-status",
    auth(ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    TaskController.getStatusCounts);


export const TaskRoutes = router;
