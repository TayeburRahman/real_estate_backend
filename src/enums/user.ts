/* eslint-disable no-unused-vars */
export enum ENUM_USER_ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  AGENT = 'AGENT',
  MEMBER = 'MEMBER',
}

export enum ENUM_SOCKET_EVENT {
  CONNECT = "connection",
  MESSAGE_NEW = "new-message",
  MESSAGE_NEW_ORDER = "new-message-order",
  MESSAGE_GETALL_ORDER = "order-messages",
  CONVERSION = "conversion",
  REVISIONS_MESSAGE = "messages",
  NOTIFICATION = "notification",
  NEW_NOTIFICATION = "new-notification",
  SEEN_NOTIFICATION = "seen-notification",
  PARTNER_LOCATION = "partner-location",

};


export enum ENUM_TASK_STATUS {
  SUBMITTED = "Submitted",
  SCHEDULED = "Scheduled",
  IN_PRODUCTION = "In-Production",
  DELIVERED = "Delivered",
  REVISIONS = "Revisions",
  COMPLETED = "Completed"
}