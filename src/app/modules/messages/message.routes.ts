import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { messageController } from './message.controller';

import { validateRequest } from '../../middlewares/validateRequest';
import { MessageValidation } from './messages.validation';
import { uploadFile } from '../../middlewares/fileUploader';

const router = express.Router();

// router.post(
//   '/send-message/:id', 
//   auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.USER,ENUM_USER_ROLE.ADMIN),
//   // validateRequest(MessageValidation.messages),
//   uploadFile(),
//   messageController.sendMessage,
// );
// router.get(
//   '/get-conversation',
//   auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.USER),
//   messageController.conversationUser,
// );
router.patch(
    '/favorite',
    auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MEMBER),
    messageController.addOrRemoveFavoriteList,
);

export const MessageRoutes = router;
