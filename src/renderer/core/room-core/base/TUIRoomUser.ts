import { ETUIRoomRole } from '../types.d';

class TUIRoomUser {
  ID = ''; // 用户ID

  name = ''; // 用户名

  avatar = ''; // 用户头像url

  role = ETUIRoomRole.AUDIENCE; // 用户角色

  isVideoStreamAvailable = false; // 是否有视频流

  isAudioStreamAvailable = false; // 是否有音频流

  isScreenStreamAvailable = false; // 是否有屏幕分享流

  isVideoStreamSubscribed = false; // 是否订阅视频流

  isAudioStreamSubscribed = false; // 是否订阅音频流

  isScreenStreamSubscribed = false; // 是否订阅屏幕分享流

  isLocal = false;

  reset() {
    this.ID = '';
    this.name = '';
    this.avatar = '';
    this.role = ETUIRoomRole.AUDIENCE;
    this.isVideoStreamAvailable = false;
    this.isAudioStreamAvailable = false;
    this.isScreenStreamAvailable = false;
    this.isVideoStreamSubscribed = false;
    this.isAudioStreamSubscribed = false;
    this.isScreenStreamSubscribed = false;
    this.isLocal = false;
  }
}

export default TUIRoomUser;
