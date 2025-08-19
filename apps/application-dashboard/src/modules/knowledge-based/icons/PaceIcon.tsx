interface PaceIconPropsType {
  height?: number;
  width?: number;
}

const PaceIcon = ({ height = 20, width = 20 }: PaceIconPropsType) => {
  return (
    <svg width={width} height={height} viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_1_5414)'>
        <path
          d='M9.99998 14.4857C4.85158 14.4857 0.677974 12.7467 0.677966 10.6015C0.677958 8.45638 4.85155 6.7174 9.99995 6.71742C15.1483 6.71744 19.3219 8.45646 19.322 10.6016C19.322 12.7468 15.1484 14.4858 9.99998 14.4857Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.94144 10.6758C5.94146 5.52736 7.68047 1.35376 9.82564 1.35375C11.9708 1.35374 13.7098 5.52733 13.7098 10.6757C13.7097 15.8241 11.9707 19.9977 9.82556 19.9977C7.6804 19.9977 5.94142 15.8242 5.94144 10.6758Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1_5414'>
          <rect width='20' height='20' fill='white' transform='translate(20 0.5) rotate(90)' />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PaceIcon;
