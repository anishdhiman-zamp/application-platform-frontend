interface ProgressWheelProps {
  completed: number;
  total: number;
  size?: number;
}

const WHEEL_RADIUS = 5.5;
const WHEEL_CIRCUMFERENCE = 2 * Math.PI * WHEEL_RADIUS;

const ProgressWheel = ({ completed, total, size = 14 }: ProgressWheelProps) => {
  const progress = total > 0 ? completed / total : 0;
  const dashOffset = WHEEL_CIRCUMFERENCE * (1 - progress);

  return (
    <svg width={size} height={size} viewBox='0 0 14 14' fill='none' className='shrink-0 -rotate-90'>
      <circle cx='7' cy='7' r={WHEEL_RADIUS} stroke='var(--GRAY_300)' strokeWidth='1.5' />
      <circle
        cx='7'
        cy='7'
        r={WHEEL_RADIUS}
        stroke='var(--GRAY_1000)'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeDasharray={WHEEL_CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
};

export default ProgressWheel;
