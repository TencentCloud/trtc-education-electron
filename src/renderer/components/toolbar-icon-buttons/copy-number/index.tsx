import a18n from 'a18n';
import React from 'react';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

interface PropsType {
  number: string;
  chatNumber: string;
}

function CopyNumberController(props: PropsType) {
  const { number, chatNumber } = props;
  const renderIcon = () => <FileCopyIcon style={{ fontSize: 15 }} />;
  const onIconClick = () => {
    logger.log('[Com CopyNumberController] clicked');
    // 创建输入框
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = 'absolute';
    textarea.style.clip = 'rect(0 0 0 0)';
    // 赋值
    textarea.value = number;
    // 选中
    textarea.select();
    // 复制
    document.execCommand('copy', true);
    Toast.info(
      number === chatNumber
        ? a18n('QQ群号已拷贝到粘贴板')
        : a18n('课堂号已拷贝到粘贴板')
    );
    if (number === chatNumber) {
      (window as any).appMonitor?.reportEvent('CopyQQ');
    }
    textarea.remove();
  };

  return (
    <ComBaseToolIconButton
      name="copyInfo"
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

export default CopyNumberController;
