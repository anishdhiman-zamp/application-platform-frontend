interface ZampLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

const ZampLogo = ({ size = 24, color = 'currentColor', className }: ZampLogoProps) => {
  return (
    <svg
      height={size}
      width={size}
      viewBox='0 0 66 53'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path d='M0 22.6284L12.4286 0H65.9408L53.5121 22.6284H0Z' fill={color} />
      <path d='M0 52.7057L12.4286 30.0752H65.9408L53.5121 52.7057H0Z' fill={color} />
    </svg>
  );
};

export default ZampLogo;
