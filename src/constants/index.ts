/**
 * 这个常量定义模块，即用于 main 目录下各个 ts 模块，也用 main/preload.js 模块，
 * 此处定义为 node.js module 格式，以上两类模块都可使用。
 *
 * 如果此处定义为 ES 6 模块（使用 import/export )，则 preload.js 模块无法使用，
 * 原因是 preload.js 文件是一个原生 node.js module 执行文件，后续如果 preload.js
 * 承担职责过多，代码复杂度较大，可以考虑使用。
 */
export enum EUserEventNames {
  // App event name
  ON_INIT_DATA = 'onInitData',
  ON_TEACHER_ENTER_CLASS_ROOM = 'onTeacherEnterClassRoom',
  ON_TEACHER_EXIT_CLASS_ROOM = 'onTeacherExitClassRoom',
  ON_STUDENT_ENTER_CLASS_ROOM = 'onStudentEnterClassRoom',
  ON_STUDENT_EXIT_CLASS_ROOM = 'onStudentExitClassRoom',
  ON_START_SHARE_SCREEN_WINDOW = 'onStartShareScreenWindow',
  ON_STOP_SHARE_SCREEN_WINDOW = 'onStopShareScreenWindow',
  ON_SELECT_SHARE_SCREEN_WINDOW = 'onSelectShareScreenWindow',
  ON_CONFIRM_SHARE_SCREEN_WINDOW = 'onConfirmShareScreenWindow',
  ON_CANCEL_SHARE_SCREEN_WINDOW = 'onCancelShareScreenWindow',
  ON_CHANGE_LOCAL_USER_STATE = 'onLocalVideoAvailable',
  ON_CHANGE_SHARE_PREVIEW_MODE = 'onChangeSharePreviewMode',
  ON_WINDOW_SHOW = 'onWindowShow',
  ON_MUTE_ALL_STUDENT = 'onMuteAllStudent',
  ON_HANDS_UP = 'onHandsUp',
  ON_CONFIRM_HAND_UP = 'onConfirmHandUp',
  ON_TEACHER_GROUP_DISMISSED = 'onTeacherGroupDismissed',
  ON_GET_GROUP_MEMBER_LIST = 'onGetGroupMemberList',
  ON_CHAT_MESSAGE = 'onChatMessage',
  ON_CLASS_TIME = 'onClassTime',
  ON_OWNER_READY = 'onOwnerReady',
  ON_TOGGLE_VIDEO_LIST = 'onToggleVideoList',
  ON_CHANGE_LOG_LEVEL = 'onChangeLogLevel',
  ON_CALL_ROLL = 'callRoll',
  ON_CALL_ROLL_REPLY = 'callRollReply',
  ON_ADD_USER = 'onAddUser',
  ON_DELETE_USER = 'onDeleteUser',
  ON_UPDATE_USER = 'onUpdateUser',
  ON_CHANGE_VIDEO_LIST_WINDOW_MODE = 'onChangeVideoListWindowMode',
  ON_UPDATE_CAMERA_STATE_FROM_TOP_TOOLBAR = 'onUpdateCameraStateFromTopToolbar',
  ON_UPDATE_MIC_STATE_FROM_TOP_TOOLBAR = 'onUpdateMicStateFromTopToolbar',
  ON_INIT_DEVICE = 'onInitDevice',
  ON_UPDATE_ALL_MIC_STATE_FROM_TOP_TOOLBAR = 'onUpdateAllMicStateFromTopToolbar',
  ON_OPEN_CAMERA_SELECT_POPUP = 'onOpenCameraSelectPopup',
  ON_OPEN_MIC_SPEAKER_SELECT_POPUP = 'onOpenMicSpeakerSelectPopup',
  ON_CHANGE_CURRENT_CAMERA = 'onChangeCurrentCamera',
  ON_CHANGE_CURRENT_MICROPHONE = 'onChangeCurrentMicrophone',
  ON_CHANGE_CURRENT_SPEAKER = 'onChangeCurrentSpeaker',
  ON_UPDATE_CALL_ROLL_STATE_FROM_TOP_TOOLBAR = 'onUpdateCallRollStateFromTopToolbar',
  // TIM event name
  ON_MESSAGE_RECEIVED = 'onMessageReceived',
  ON_CLASS_MEMBER_ENTER = 'onClassMemberEnter',
  ON_CLASS_MEMBER_QUIT = 'onClassMemberQuit',
  // TRTC event name
  ON_REMOTE_USER_ENTER_ROOM = 'onRemoteUserEnterRoom',
  ON_REMOTE_USER_LEAVE_ROOM = 'onRemoteUserLeaveRoom',
  ON_USER_VIDEO_AVAILABLE = 'onUserVideoAvailable',
  ON_USER_AUDIO_AVAILABLE = 'onUserAudioAvailable',
  ON_USER_SUB_STREAM_AVAILABLE = 'onUserSubStreamAvailable',
}

export default {
  EUserEventNames,
};
