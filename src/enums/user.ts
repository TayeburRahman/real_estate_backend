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
  NOTIFICATION = "notification",
  NEW_NOTIFICATION = "new-notification",
  SEEN_NOTIFICATION = "seen-notification",
  MESSAGE_NEW = "new-message",
  MESSAGE_GETALL = "message",
  CONVERSION = "conversion",
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