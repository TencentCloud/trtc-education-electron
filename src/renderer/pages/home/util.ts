import { tuiRoomCore, TUIRoomInfo } from '../../core/room-core';
import logger from '../../utils/logger';

async function login(userID: string) {
  logger.debug(`[Home]login userID: ${userID}`);
  const { userSig, sdkAppId } = await (window as any).electron.genTestUserSig(
    userID
  );
  const tuiResponse = await tuiRoomCore.login(sdkAppId, userID, userSig);
  return tuiResponse;
}

async function checkRoomExistence(roomID: string): Promise<TUIRoomInfo | null> {
  logger.debug(`[Home]checkRoomExistence roomID: ${roomID}`);
  const tuiResponse = await tuiRoomCore.checkRoomExistence(roomID);
  return tuiResponse.data;
}

async function logout(userID: string) {
  logger.debug(`[Home]logout userID: ${userID}`);
  const tuiResponse = await tuiRoomCore.logout();
  return tuiResponse;
}

export default {
  login,
  logout,
  checkRoomExistence,
};
