import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import Button from './base-components/index';
import DeviceConnect from './deviceConnect';
import CameraDetector from './cameraDetector';
import MicDetector from './micDetector';
import SpeakerDetector from './speakerDetector';
import NetworkDetector from './networkDetector';
import DetectorReport from './detectorReport';
import { CameraIcon, MicIcon, SpeakerIcon, NetworkIcon } from './utils';
import './index.scss';
import en from '../../locales/device-en';
import zh from '../../locales/device-zh';

a18n.addLocaleResource('en-US', en);
a18n.addLocaleResource('zh-CN', zh);

interface DeviceDetectorProps {
  visible: any;
  onClose: any;
  audioUrl: string;
  hasNetworkDetect: boolean;
  networkDetectInfo: any;
  onFinishDeviceTest: any;
}
function DeviceDetector(props: DeviceDetectorProps) {
  const {
    visible,
    onClose,
    audioUrl = '',
    hasNetworkDetect = true,
    networkDetectInfo,
    onFinishDeviceTest,
  } = props;
  const [open, setOpen] = useState(false);
  const [detectStage, setDetectStage] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [containerStyle, setContainerStyle] = useState({});

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const stepNameList = ['camera', 'microphone', 'speaker', 'network'];
  if (!hasNetworkDetect) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    stepNameList.indexOf('network') >= 0 &&
      stepNameList.splice(stepNameList.indexOf('network'), 1);
  }

  const handleSize = () => {
    if (window.innerWidth > 520) {
      setContainerStyle({
        transform: 'scale(1)',
      });
      return;
    }
    const Width = 520;
    const Height = 480;
    const scaleX = window.innerWidth / Width;
    const scaleY = window.innerHeight / Height;
    const scale = Math.min(scaleX, scaleY);
    setContainerStyle({
      transform: `scale(${scale})`,
    });
  };

  useEffect(() => {
    handleSize();
    // @ts-ignore
    window.addEventListener('resize', handleSize.bind(this));
    return () => {
      // @ts-ignore
      window.removeEventListener('resize', handleSize.bind(this));
    };
  }, []);

  const stopBubble = (event: any) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  // 重新检测
  const handleReset = () => {
    setCompleted({});
    setDetectStage(0);
    setActiveStep(0);
  };

  // 完成检测
  const handleClose = () => {
    onFinishDeviceTest(true);
    setOpen(false);
    handleReset();
    onClose();
  };

  // 点击切换step
  const handleStep = (step: any) => {
    if (
      // @ts-ignore
      completed[stepNameList[step]] &&
      // @ts-ignore
      completed[stepNameList[step]].completed
    ) {
      setActiveStep(step);
    }
  };

  // 处理step的完成事件
  const handleCompleted = (type: any, results: any) => {
    setCompleted((prevConfig) => ({
      ...prevConfig,
      [stepNameList[activeStep]]: {
        completed: true,
        type,
        results,
      },
    }));
    if (activeStep < stepNameList.length - 1) {
      setActiveStep(activeStep + 1);
    }
    if (
      stepNameList.indexOf('network') < 0 &&
      activeStep === stepNameList.length - 1
    ) {
      setDetectStage(2);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="device-detector-backdrop">
      <div className="root" style={containerStyle} onClick={stopBubble}>
        <Button type="outlined" className="close" onClick={handleClose}>
          {a18n('跳过检测')}
        </Button>
        {detectStage === 0 && (
          <DeviceConnect
            stepNameList={stepNameList}
            startDeviceDetect={() => setDetectStage(1)}
          />
        )}
        {detectStage === 1 && (
          <div className="step-container">
            {stepNameList.map((label, index) => {
              const success =
                // @ts-ignore
                completed[stepNameList[index]] &&
                // @ts-ignore
                completed[stepNameList[index]].type === 'success';
              // @ts-ignore
              const error =
                // @ts-ignore
                completed[stepNameList[index]] &&
                // @ts-ignore
                completed[stepNameList[index]].type === 'error';
              const active = activeStep === index;
              let stateClassName = '';
              if (active || success) {
                stateClassName = 'active';
              } else if (error) {
                stateClassName = 'error';
              }
              return (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  // @ts-ignore
                  onClick={handleStep.bind(this, index)}
                  className={`step ${stateClassName}`}
                >
                  <span className="step-icon">
                    {label === 'camera' && CameraIcon}
                    {label === 'microphone' && MicIcon}
                    {label === 'speaker' && SpeakerIcon}
                    {label === 'network' && NetworkIcon}
                  </span>
                  <span className="step-label">{label.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        )}
        {detectStage === 1 && (
          <div className="testing-container">
            {stepNameList.map((step, index) => {
              if (step === 'camera') {
                // @ts-ignore
                return (
                  // @ts-ignore
                  <CameraDetector
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    activeDetector={stepNameList[activeStep]}
                    handleCompleted={handleCompleted}
                  />
                );
              }
              if (step === 'microphone') {
                // @ts-ignore
                return (
                  // @ts-ignore
                  <MicDetector
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    activeDetector={stepNameList[activeStep]}
                    handleCompleted={handleCompleted}
                  />
                );
              }
              if (step === 'speaker') {
                return (
                  // @ts-ignore
                  <SpeakerDetector
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    audioUrl={audioUrl}
                    activeDetector={stepNameList[activeStep]}
                    handleCompleted={handleCompleted}
                  />
                );
              }
              if (step === 'network') {
                return (
                  // @ts-ignore
                  <NetworkDetector
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    activeDetector={stepNameList[activeStep]}
                    networkDetectInfo={networkDetectInfo}
                    handleCompleted={handleCompleted}
                    generateReport={() => setDetectStage(2)}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
        {detectStage === 2 && (
          <DetectorReport
            reportData={completed}
            handleReset={handleReset}
            handleClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

export default DeviceDetector;
