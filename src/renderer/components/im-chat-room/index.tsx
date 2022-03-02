import React, { useRef, useEffect, useState } from 'react';
import GithubLink from '../toolbar-icon-buttons/github-link';
import OfficialWebsiteLink from '../toolbar-icon-buttons/offical-website-link';
import logger from '../../utils/logger';
import './index.scss';

function BottomIm(props: Record<string, any>) {
  const logPrefix = '[BottomIM]';
  const { messageList, sendChatMessage, currentUserID } = props;
  logger.log(`${logPrefix} props:`, messageList);
  const [inputMsg, setInputMsg] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const updateInputMsg = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputMsg(event.target.value);
  };

  function sendMessage() {
    if (inputMsg === '' || inputMsg === null || /^\s+$/gi.test(inputMsg)) {
      return;
    }
    sendChatMessage(inputMsg);
    setInputMsg('');
    (window as any).appMonitor?.reportEvent('SendChatMessage');
  }
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // @ts-ignore
    messagesEndRef.current.scrollIntoView(false); // 与底部对齐
  });

  return (
    <div className="im-content">
      <div className="content-top-chat">
        <div className="content-github-link">
          <div>
            大家好，Electron 版实时互动课堂的开源 App
            已发布，大家感兴趣可以体验下。
          </div>
          <div>
            开源库地址：
            <GithubLink />
          </div>
          <div>
            实时互动课堂官网链接： <OfficialWebsiteLink />
          </div>
        </div>
        {messageList &&
          messageList.map((message: Record<string, any>) => {
            return (
              <div
                key={message.ID}
                className={
                  message.from === currentUserID
                    ? 'content-bottom-chat sent'
                    : 'content-bottom-chat receive'
                }
              >
                <div>{message.nick || message.from}</div>
                <div className="content-bottom-chat-out">
                  <span className="content-bottom-chat-inner">
                    {message.payload.text}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
      <div className="content-bottom-submit">
        <div className="content-bottom-feel" />
        <textarea
          value={inputMsg}
          onChange={updateInputMsg}
          onKeyDown={handleKeyDown}
          className="content-bottom-input"
          placeholder="请输入内容"
        />
      </div>
    </div>
  );
}

export default BottomIm;
