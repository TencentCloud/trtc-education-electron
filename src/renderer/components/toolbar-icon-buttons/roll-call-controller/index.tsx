import React from 'react';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ComBaseToolIconButton from '../base';

interface PropsType {
  mode?: string;
  onCallAllStudent: () => void;
  isRolled?: boolean;
}
function ComRollCallController(props: PropsType) {
  const { mode, onCallAllStudent, isRolled } = props;
  const renderIcon = () => <LocationOnOutlinedIcon />;

  return (
    <ComBaseToolIconButton
      name={!isRolled ? '点名' : '结束点名'}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onCallAllStudent}
    />
  );
}

ComRollCallController.defaultProps = {
  mode: 'small',
  isRolled: false,
};

export default ComRollCallController;
