import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import RTCDetect from './rtc-detect';
import TRTC from './trtc-js-sdk';
import Button from './base-components/index';
import { NETWORK_QUALITY } from './utils';

let uplinkClient: any = null;
let downlinkClient: any = null;
let uplinkStream: any = null;
const networkTestingResult = {
  uplinkNetworkQualities: [],
  downlinkNetworkQualities: [],
  rttList: [],
};
const currentDetector = 'network';
let timer: NodeJS.Timeout | null = null;

interface NetworkDetectorProps {
  activeDetector: any;
  networkDetectInfo: any;
  handleCompleted: any;
  generateReport: any;
}
function NetworkDetector(props: NetworkDetectorProps) {
  const { activeDetector, networkDetectInfo, handleCompleted, generateReport } =
    props;
  const [detectorInfo, setDetectorInfo] = useState({});
  const [count, setCount] = useState(15);

  // 获取上行网络质量和RTT
  const testUplinkNetworkQuality = async () => {
    const { sdkAppId, roomId } = networkDetectInfo;
    const { uplinkUserId, uplinkUserSig } = networkDetectInfo.uplinkUserInfo;
    uplinkClient = TRTC.createClient({
      sdkAppId,
      userId: uplinkUserId,
      userSig: uplinkUserSig,
      mode: 'rtc',
      useStringRoomId: typeof roomId === 'string',
    });

    uplinkStream = TRTC.createStream({ audio: true, video: true });
    await uplinkStream.initialize();

    uplinkClient.on('network-quality', async (event: any) => {
      const { uplinkNetworkQuality } = event;
      // @ts-ignore
      networkTestingResult.uplinkNetworkQualities.push(uplinkNetworkQuality);
      setDetectorInfo((prevConfig) => ({
        ...prevConfig,
        uplinkQuality: uplinkNetworkQuality,
      }));
      const { rtt } = await uplinkClient.getTransportStats();
      setDetectorInfo((prevConfig) => ({
        ...prevConfig,
        rtt,
      }));
      // @ts-ignore
      networkTestingResult.rttList.push(rtt);
    });

    await uplinkClient.join({ roomId }); // 加入用于测试的房间
    await uplinkClient.publish(uplinkStream);
  };

  // 获取下行网络质量
  async function testDownlinkNetworkQuality() {
    const { sdkAppId, roomId } = networkDetectInfo;
    const { downlinkUserId, downlinkUserSig } =
      networkDetectInfo.downlinkUserInfo;
    downlinkClient = TRTC.createClient({
      sdkAppId,
      userId: downlinkUserId,
      userSig: downlinkUserSig,
      mode: 'rtc',
      useStringRoomId: typeof roomId === 'string',
    });

    downlinkClient.on('stream-added', async (event: any) => {
      await downlinkClient.subscribe(event.stream, {
        audio: true,
        video: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-shadow
      downlinkClient.on('network-quality', (event: any) => {
        const { downlinkNetworkQuality } = event;
        networkTestingResult.downlinkNetworkQualities.push(
          // @ts-ignore
          downlinkNetworkQuality
        );
        setDetectorInfo((prevConfig) => ({
          ...prevConfig,
          downlinkQuality: downlinkNetworkQuality,
        }));
      });
    });

    await downlinkClient.join({ roomId }); // 加入用于测试的房间
  }

  const getDetectorInfo = async () => {
    const detect = new RTCDetect();
    const systemResult = detect.getSystem();
    const webRTCSupportResult = await detect.isTRTCSupported();
    const APISupportResult = detect.getAPISupported();

    const detectorInfos = {
      system: systemResult.OS,
      browser: `${systemResult.browser.name} ${systemResult.browser.version}`,
      TRTCSupport: webRTCSupportResult.result ? a18n('支持') : a18n('不支持'),
      screenMediaSupport: APISupportResult.isScreenCaptureAPISupported
        ? a18n('支持')
        : a18n('不支持'),
    };
    setDetectorInfo(detectorInfos);

    timer = setInterval(() => {
      setCount((prevValue) => {
        const newValue = prevValue - 1;
        if (newValue === 0) {
          // @ts-ignore
          clearInterval(timer);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    testUplinkNetworkQuality();
    testDownlinkNetworkQuality();
  };

  // 获取15秒检测平均值
  const getAverageInfo = (detectorInfos: any) => {
    const uplinkAverageQuality = Math.ceil(
      networkTestingResult.uplinkNetworkQualities.reduce(
        (value, current) => value + current,
        0
      ) / networkTestingResult.uplinkNetworkQualities.length
    );
    const downlinkAverageQuality = Math.ceil(
      networkTestingResult.downlinkNetworkQualities.reduce(
        (value, current) => value + current,
        0
      ) / networkTestingResult.downlinkNetworkQualities.length
    );
    const rttAverageQuality = Math.ceil(
      networkTestingResult.rttList.reduce(
        (value, current) => value + current,
        0
      ) / networkTestingResult.rttList.length
    );
    const detectorResultInfo = {
      ...detectorInfos,
      uplinkQuality: uplinkAverageQuality,
      downlinkQuality: downlinkAverageQuality,
      rtt: rttAverageQuality,
    };
    handleCompleted('success', detectorResultInfo);
    setDetectorInfo(detectorResultInfo);
  };

  useEffect(() => {
    if (activeDetector === currentDetector && count !== 0) {
      setCount(15);
      getDetectorInfo();
    }
    return () => {
      // @ts-ignore
      clearInterval(timer);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      uplinkStream && uplinkStream.close();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      uplinkClient && uplinkClient.leave();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      downlinkClient && downlinkClient.leave();
    };
  }, [activeDetector]);

  useEffect(() => {
    if (count === 0) {
      getAverageInfo(detectorInfo);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      uplinkStream && uplinkStream.close();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      uplinkClient && uplinkClient.leave();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      downlinkClient && downlinkClient.leave();
    }
  }, [count]);

  return (
    activeDetector === currentDetector && (
      <div className="testing-body">
        <div className="testing-list">
          <div className="testing-item-container">
            <div>{a18n('操作系统')}</div>
            {/* @ts-ignore */}
            <div className={!detectorInfo.system ? 'network-loading' : ''}>
              {/* @ts-ignore */}
              {detectorInfo.system}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('浏览器')}</div>
            {/* @ts-ignore */}
            <div className={!detectorInfo.browser ? 'network-loading' : ''}>
              {/* @ts-ignore */}
              {detectorInfo.browser}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('是否支持TRTC')}</div>
            {/* @ts-ignore */}
            <div className={!detectorInfo.TRTCSupport ? 'network-loading' : ''}>
              {/* @ts-ignore */}
              {detectorInfo.TRTCSupport}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('是否支持屏幕分享')}</div>
            {/* @ts-ignore */}
            <div
              className={
                // @ts-ignore
                !detectorInfo.screenMediaSupport ? 'network-loading' : ''
              }
            >
              {/* @ts-ignore */}
              {detectorInfo.screenMediaSupport}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('网络延时')}</div>
            {/* @ts-ignore */}
            <div className={!detectorInfo.rtt ? 'network-loading' : ''}>
              {/* @ts-ignore */}
              {detectorInfo.rtt ? `${detectorInfo.rtt}ms` : ''}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('上行网络质量')}</div>
            {/* @ts-ignore */}
            <div
              className={
                // @ts-ignore
                !NETWORK_QUALITY[detectorInfo.uplinkQuality]
                  ? 'network-loading'
                  : ''
              }
            >
              {/* @ts-ignore */}
              {a18n(NETWORK_QUALITY[detectorInfo.uplinkQuality] || '')}
            </div>
          </div>
          <div className="testing-item-container">
            <div>{a18n('下行网络质量')}</div>
            {/* @ts-ignore */}
            <div
              className={
                // @ts-ignore
                !NETWORK_QUALITY[detectorInfo.downlinkQuality]
                  ? 'network-loading'
                  : ''
              }
            >
              {/* @ts-ignore */}
              {a18n(NETWORK_QUALITY[detectorInfo.downlinkQuality] || '')}
            </div>
          </div>
        </div>
        {count > 0 ? (
          <Button
            className="gray-button"
            type="disabled"
            onClick={() => {}}
          >{a18n`剩余检测时间（${count}）s`}</Button>
        ) : (
          <Button
            className="report-button"
            type="contained"
            onClick={generateReport}
          >
            {a18n('查看检测报告')}
          </Button>
        )}
      </div>
    )
  );
}

export default NetworkDetector;
