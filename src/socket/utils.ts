/* eslint-disable @typescript-eslint/ban-ts-comment */

export const SocketResponse = (data: any) => {
  return {
    message: data?.message,
    data: data,
  };
};
export const emitMessage = (key: any, data: any) => {
  //@ts-ignore
  const io = global.io;
  io.emit(key, data);
};
