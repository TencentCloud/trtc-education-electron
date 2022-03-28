import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './utils/monitor';
import logger, { LogLevelType } from './utils/logger';
import { EUserEventNames } from '../constants';
import { Notification } from './components/toast';
import Home from './pages/home';
import TeacherHomePage from './pages/teacher/home';
import TeacherTopToolbarPage from './pages/teacher/top-toolbar';
import TeacherShareScreenSelectPage from './pages/teacher/share-screen-select';
import TeacherSharePreviewPage from './pages/teacher/share-screen-preview';
import StudentHomePage from './pages/student/home';
import CameraSelectorPage from './pages/common/camera-selector';
import MicrophoneSpeakerSelectorPage from './pages/common/microphone-speaker-selector';
import { initCurrentUserStore, updateUserID } from './store/user/userSlice';
import { initEnvStore } from './store/env/envSlice';
import { initDeviceStore } from './store/device/deviceSlice';
import './App.global.scss';

logger.setLevel(LogLevelType.LOG_LEVEL_DEBUG);

const viewMap = new Map<string, React.FunctionComponent>();
viewMap.set('home', Home);
viewMap.set('class-room', TeacherHomePage);
viewMap.set('class-room-top', TeacherTopToolbarPage);
viewMap.set('share-screen-select', TeacherShareScreenSelectPage);
viewMap.set('share-preview', TeacherSharePreviewPage);
viewMap.set('student', StudentHomePage);
viewMap.set('camera-selector', CameraSelectorPage);
viewMap.set('microphone-speaker-selector', MicrophoneSpeakerSelectorPage);

function ViewManager() {
  const logPrefix = '[ViewManager]';

  const dispatch = useDispatch();
  function handleInitData(event: any, args: any) {
    logger.log(`${logPrefix}.handleInitData args:`, args);
    dispatch(
      initCurrentUserStore({
        ...args.currentUser,
      })
    );
    dispatch(initEnvStore(args));
    dispatch(initDeviceStore(args.device));
  }

  function clearMonitorStorage() {
    logger.debug(`${logPrefix}clearMonitorStorage`);
    (window as any).appMonitor?.clearStorage();
  }

  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_INIT_DATA,
      handleInitData
    );
    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_INIT_DATA,
        handleInitData
      );
    };
  }, []);
  const query = new URLSearchParams(window.location.search);
  const viewName = query.get('view') || '';
  let Component = viewMap.get(viewName) || null;
  if (!Component) {
    Component = Home;
  }

  // 首次加载应用
  if (viewName === 'home') {
    window.onbeforeunload = clearMonitorStorage;
    (window as any).appMonitor?.reportEvent('Launch');
  }

  document.body.className = `body-view-${viewName}`;

  const userID = localStorage.getItem('userID');
  if (userID) {
    dispatch(updateUserID(userID));
  }

  return (
    <Router>
      <Switch>
        <Route path="/" component={Component} />
      </Switch>
      <Notification />
    </Router>
  );
}

export default ViewManager;
