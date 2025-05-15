import { LOG_STATUS } from 'modules/process/process.types';

type LogStatusIndicatorProps = {
  fillColor: string;
  strokeColor: string;
  status: LOG_STATUS;
};

const LogStatusIndicator = ({ fillColor, strokeColor, status }: LogStatusIndicatorProps) => {
  switch (status) {
    case LOG_STATUS.NEEDS_ATTENTION:
    case LOG_STATUS.FAILED:
    case LOG_STATUS.LOADING:
      return (
        <svg width='14' height='13' viewBox='0 0 14 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect
            x='0.813571'
            y='6.07129'
            width='8.75'
            height='8.75'
            rx='1.875'
            transform='rotate(-45 0.813571 6.07129)'
            fill={fillColor}
            fillOpacity='0.16'
            stroke={strokeColor}
            strokeWidth='1.25'
          />
        </svg>
      );
    case LOG_STATUS.VOID:
    case LOG_STATUS.SUCCESS:
    case LOG_STATUS.MESSAGE_FROM_USER:
    case LOG_STATUS.MESSAGE_FROM_ADAM:
    case LOG_STATUS.DONE:
      return (
        <svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect
            x='0.625'
            y='0.625'
            width='8.75'
            height='8.75'
            rx='1.875'
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth='1.25'
          />
        </svg>
      );
  }
};

export default LogStatusIndicator;
