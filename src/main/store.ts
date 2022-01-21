interface LocalUser {
  roomID?: string;
  userID?: string;
  role?: string;
  isCameraStarted?: boolean;
  isMicStarted?: boolean;
  isMicMuted?: boolean;
  isSpeakerStarted?: boolean;
  isSpeakerMuted?: boolean;
  currentCamera?: any;
  currentMic?: any;
  currentSpeaker?: any;
  sharingScreenInfo?: any;
  isAllStudentMuted?: boolean;
  platform?: string;
  classStartTime?: number;
  callRollTime?: number;
  isRolled?: boolean;
  isLocal: true;
}

interface WindowBaseInfo {
  mediaSourceId: string;
  windowID?: number;
}

interface StoreType {
  currentUser: LocalUser;
  messages: Array<any>;
  windowBaseInfoMap: Record<number, WindowBaseInfo>;
  userMap: Record<string, any>;
  device: {
    cameraList: Array<Record<string, any>>;
    microphoneList: Array<Record<string, any>>;
    speakerList: Array<Record<string, any>>;
  };
}

const store: StoreType = {
  currentUser: {
    platform: process.platform,
    isLocal: true,
  },
  messages: [],
  windowBaseInfoMap: {},
  userMap: {},
  device: {
    cameraList: [],
    microphoneList: [],
    speakerList: [],
  },
};

export function clearStore() {
  store.currentUser = {
    platform: process.platform,
    isLocal: true,
  };
  store.messages = [];
  store.windowBaseInfoMap = {};
  store.userMap = {};
  store.device.cameraList = [];
  store.device.microphoneList = [];
  store.device.speakerList = [];
}

export default store;
