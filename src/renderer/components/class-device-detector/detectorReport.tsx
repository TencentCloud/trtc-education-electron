import a18n from 'a18n';
import React from 'react';
import {
  CameraIcon,
  MicIcon,
  SpeakerIcon,
  NetworkIcon,
  NETWORK_QUALITY,
} from './utils';
import Button from './base-components/index';

interface DetectorReportProps {
  reportData: any;
  handleReset: any;
  handleClose: any;
}
function DetectorReport(props: DetectorReportProps) {
  const { reportData, handleReset, handleClose } = props;
  return (
    <div className="device-testing-report">
      <div className="testing-title">{a18n('检测报告')}</div>
      <div className="device-report-list">
        <div className="device-report">
          <div className="device-info">
            <span className="report-icon">{CameraIcon}</span>
            <div className="device-name">{reportData.camera.results}</div>
          </div>
          <div
            className={`${
              reportData.camera.type === 'success' ? 'green' : 'red'
            }`}
          >
            {reportData.camera.type === 'success' ? a18n('正常') : a18n('异常')}
          </div>
        </div>
        <div className="device-report">
          <div className="device-info">
            <span className="report-icon">{MicIcon}</span>
            <div className="device-name">{reportData.microphone.results}</div>
          </div>
          <div
            className={`${
              reportData.microphone.type === 'success' ? 'green' : 'red'
            }`}
          >
            {reportData.microphone.type === 'success'
              ? a18n('正常')
              : a18n('异常')}
          </div>
        </div>
        {reportData.speaker && (
          <div className="device-report">
            <div className="device-info">
              <span className="report-icon">{SpeakerIcon}</span>
              <div className="device-name">{reportData.speaker.results}</div>
            </div>
            <div
              className={`${
                reportData.speaker.type === 'success' ? 'green' : 'red'
              }`}
            >
              {reportData.speaker.type === 'success'
                ? a18n('正常')
                : a18n('异常')}
            </div>
          </div>
        )}
        {reportData.network && (
          <div className="device-report">
            <div className="device-info">
              <span className="report-icon">{NetworkIcon}</span>
              <div className="device-name">{a18n('网络延时')}</div>
            </div>
            <div
              className={`${
                reportData.network.result.rtt <= 200 ? 'green' : 'red'
              }`}
            >
              {`${reportData.network.result.rtt}ms`}
            </div>
          </div>
        )}
        {reportData.network && (
          <div className="device-report">
            <div className="device-info">
              <span className="report-icon">{NetworkIcon}</span>
              <div className="device-name">{a18n('上行网络质量')}</div>
            </div>
            <div
              className={`${
                reportData.network.result.uplinkQuality > 0 &&
                reportData.network.result.uplinkQuality < 4
                  ? 'green'
                  : 'red'
              }`}
            >
              {/* @ts-ignore */}
              {a18n(NETWORK_QUALITY[reportData.network.result.uplinkQuality])}
            </div>
          </div>
        )}
        {reportData.network && (
          <div className="device-report">
            <div className="device-info">
              <span className="report-icon">{NetworkIcon}</span>
              <div className="device-name">{a18n('下行网络质量')}</div>
            </div>
            <div
              className={`${
                reportData.network.result.downlinkQuality > 0 &&
                reportData.network.result.downlinkQuality < 4
                  ? 'green'
                  : 'red'
              }`}
            >
              {/* @ts-ignore */}
              {a18n(NETWORK_QUALITY[reportData.network.result.downlinkQuality])}
            </div>
          </div>
        )}
      </div>
      <div className="device-report-footer">
        <Button type="outlined" onClick={handleReset} className="">
          {a18n('重新检测')}
        </Button>
        <Button type="contained" onClick={handleClose} className="">
          {a18n('完成检测')}
        </Button>
      </div>
    </div>
  );
}

export default DetectorReport;
