import { useEffect, useRef, useState } from 'react';
import { LOG_STATUS } from 'modules/process/process.types';
import { motion, useInView } from 'motion/react';
import { COLORS } from '@/constants/colors';

type LogStatusIndicatorProps = {
  fillColor: string;
  strokeColor: string;
  status: LOG_STATUS;
  shouldRotate?: boolean;
  showBlueStrokeRef?: React.MutableRefObject<((show: boolean) => void) | null>;
};

const LogStatusIndicator = ({
  fillColor,
  strokeColor,
  status,
  shouldRotate = true,
  showBlueStrokeRef,
}: LogStatusIndicatorProps) => {
  const svgSize = 14;
  const svgRectSize = 8.75;
  const isLoadingShape = status === LOG_STATUS.LOADING;
  const isErrorShape = [LOG_STATUS.NEEDS_ATTENTION, LOG_STATUS.FAILED].includes(status);
  const initialIndicatorAngle = shouldRotate ? 45 : 0;
  const internalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { once: false });
  const [showBlueStroke, setShowBlueStroke] = useState(false);
  const [rotation, setRotation] = useState(initialIndicatorAngle);

  // snap rotation to nearest 90° when stops
  const adjustRotationToNearest90 = (prevAngle: number, isErrorShape: boolean): number => {
    const normalizedAngle = ((prevAngle % 360) + 360) % 360;

    if (isErrorShape) return prevAngle;

    const rotationAdjustment = 90 - (normalizedAngle % 90);

    return prevAngle + rotationAdjustment;
  };

  // triggers stroke color and rotation
  useEffect(() => {
    if (!isInView || !showBlueStrokeRef || !isLoadingShape || !shouldRotate) return;

    if (showBlueStrokeRef && status === LOG_STATUS.LOADING) {
      showBlueStrokeRef.current = (show) => {
        setShowBlueStroke(show);
        if (show) setRotation((prev) => prev + 90);
      };
    }

    return () => {
      showBlueStrokeRef.current = null;
    };
  }, [showBlueStrokeRef, isInView, isLoadingShape, shouldRotate]);

  useEffect(() => {
    const isActive = showBlueStrokeRef?.current || isLoadingShape;

    if (isActive || !shouldRotate) return;

    setRotation((prev) => adjustRotationToNearest90(prev, isErrorShape));
  }, [status, shouldRotate, isLoadingShape, isErrorShape, showBlueStrokeRef]);

  return (
    <div ref={internalRef}>
      <motion.svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        fill={fillColor}
        xmlns='http://www.w3.org/2000/svg'
        style={{ transformOrigin: 'center center' }}
        initial={{ rotate: initialIndicatorAngle }}
        animate={{ rotate: rotation }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <rect
          width={svgRectSize}
          height={svgRectSize}
          rx={1.875}
          x={(svgSize - svgRectSize) / 2}
          y={(svgSize - svgRectSize) / 2}
          fill={showBlueStroke ? COLORS.BLUE_100 : fillColor}
          fillOpacity={isErrorShape || isLoadingShape ? '0.1' : '0.6'}
          stroke={showBlueStroke ? COLORS.BLUE_450 : strokeColor}
          strokeWidth={1.25}
          style={{ transition: 'stroke 0.3s ease-in-out' }}
        />
      </motion.svg>
    </div>
  );
};

export default LogStatusIndicator;
