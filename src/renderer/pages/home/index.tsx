import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import packageConfig from '../../../../package.json';
import buildPackageConfig from '../../../../build/app/package.json';
import Toast from '../../components/toast';
import {
  updateUserID,
  updateRoomID,
  updateClassType,
} from '../../store/user/userSlice';
import { EUserEventNames } from '../../../constants';
import logger from '../../utils/logger';
import homeUtil from './util';
import './index.scss';

function Home() {
  const logPrefix = '[Home]';
  const appVersion = `${buildPackageConfig.version}.${packageConfig.build.buildVersion}`;
  logger.log(`${logPrefix} appVersion:`, appVersion);
  const userID = useSelector((state: any) => state.user.userID);
  const roomID = useSelector((state: any) => state.user.roomID);
  const classType = useSelector((state: any) => state.user.classType);
  const platform = useSelector((state: any) => state.user.platform);
  const [oldUserID, setOldUserID] = useState<string>('');
  logger.log(
    `${logPrefix} platform: ${platform}, userID:${userID} roomID:${roomID} classType:${classType}`
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!roomID) {
      dispatch(updateRoomID(Math.floor(Math.random() * 10000000).toString()));
    }
  }, [dispatch, roomID]);

  function handleRoomIDChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newRoomID = +event.target.value;
    if (isNaN(newRoomID)) {
      return;
    }
    dispatch(updateRoomID(newRoomID));
  }

  function handleUserIDChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newUserID = event.target.value as string;
    dispatch(updateUserID(newUserID));
    localStorage.setItem('userID', newUserID);
  }

  function handleClassTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    dispatch(updateClassType(event.target.value as string));
  }

  async function isRoomExisted() {
    try {
      if (oldUserID !== userID) {
        if (oldUserID) {
          await homeUtil.logout(oldUserID);
        }
        setOldUserID(userID);
        await homeUtil.login(userID);
      }
      const result = await homeUtil.checkRoomExistence(roomID);
      logger.debug(`${logPrefix}isRoomExisted checkRoomExistence:`, result);
      return result;
    } catch (error) {
      logger.error(`${logPrefix}isRoomExisted error:`, error);
      Toast.error(a18n('房间号检测异常'));
      throw error;
    }
  }

  async function createClass() {
    if (!userID || !roomID) {
      return;
    }
    try {
      const roomInfo = await isRoomExisted();
      if (roomInfo && roomInfo.ownerID !== userID) {
        Toast.error(a18n('课堂号已存在，请更换课堂号。'));
        return;
      }
    } catch (error) {
      logger.error(a18n`${logPrefix}createClass 课堂号检查失败。`, error);
      return;
    }
    const response = await (window as any).electron.ipcRenderer.invoke(
      EUserEventNames.ON_TEACHER_ENTER_CLASS_ROOM,
      {
        roomID,
        userID,
        role: 'teacher',
      }
    );
    logger.log(`${logPrefix}createClass response from Main:`, response);
  }

  async function enterClass() {
    if (!userID || !roomID) {
      return;
    }
    try {
      const roomInfo = await isRoomExisted();
      if (!roomInfo) {
        Toast.error(a18n('老师尚未创建课堂。'));
        return;
      }
    } catch (error) {
      logger.error(a18n`${logPrefix}createClass 课堂号检查失败。`, error);
      return;
    }
    const response = await (window as any).electron.ipcRenderer.invoke(
      EUserEventNames.ON_STUDENT_ENTER_CLASS_ROOM,
      {
        roomID,
        userID,
        role: 'student',
      }
    );
    logger.log(`${logPrefix}enterClass response from Main:`, response);
  }

  return (
    <div className="trtc-edu-home">
      <form className="trtc-edu-home-form" noValidate autoComplete="off">
        <div className="form-item">
          <div className="form-item-label">{a18n('您的名称')}</div>
          <TextField
            variant="outlined"
            value={userID}
            onChange={handleUserIDChange}
          />
        </div>
        <div className="form-item">
          <div className="form-item-label">{a18n('课堂ID')}</div>
          <TextField
            variant="outlined"
            value={roomID}
            inputProps={{ inputMode: 'numeric' }}
            onChange={handleRoomIDChange}
          />
        </div>
        <div className="form-item">
          <div className="form-item-label">{a18n('课堂类型')}</div>
          <FormControl variant="outlined">
            <Select value={classType} onChange={handleClassTypeChange as any}>
              <MenuItem value="education">{a18n('互动课堂')}</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="form-item">
          <Button
            variant="contained"
            className="create-class-btn"
            onClick={createClass}
          >
            {a18n('创建课堂')}
          </Button>
          <Button
            variant="contained"
            className="enter-class-btn"
            onClick={enterClass}
          >
            {a18n('进入课堂')}
          </Button>
        </div>
      </form>
      <div className="home-empty" />
      <div className="home-qq-number">
        {a18n('如有任何问题可以联系我们，QQ 群号：695855795')}
      </div>
    </div>
  );
}

export default Home;
