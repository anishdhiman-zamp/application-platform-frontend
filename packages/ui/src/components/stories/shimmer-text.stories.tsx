import type { Meta, StoryObj } from '@storybook/react';
import { ShimmerText } from '../animations';
import React, { useEffect, useRef } from 'react';

const meta = {
  title: 'Animations/ShimmerText',
  component: ShimmerText,
  argTypes: {
    text: {
      control: 'text',
      description: 'The text to display with shimmer effect',
    },
    baseTextClassName: {
      control: 'text',
      description: 'Additional CSS classes for the base text',
    },
    shimmerTextClassName: {
      control: 'text',
      description: 'Additional CSS classes for the shimmer text',
    },
  },
  args: {
    text: 'Shimmering Text',
  },
  render: (args) => <ShimmerText {...args} />,
} satisfies Meta<typeof ShimmerText>;

export default meta;
type Story = StoryObj<typeof ShimmerText>;

export const Default: Story = {};

export const WithAutomaticAnimation: Story = {
  render: function Render(args) {
    const shimmerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      // Auto-trigger the animation when component mounts
      const timer = setInterval(() => {
        shimmerRef.current?.();
      }, 3000);

      // Initial trigger
      shimmerRef.current?.();

      return () => clearInterval(timer);
    }, []);

    return <ShimmerText {...args} shimmerControlRef={shimmerRef} />;
  },
  args: {
    text: 'Auto-shimmering Text',
  },
};

export const WithCustomClasses: Story = {
  render: function Render(args) {
    const shimmerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      // Auto-trigger the animation when component mounts
      const timer = setInterval(() => {
        shimmerRef.current?.();
      }, 3000);

      // Initial trigger
      shimmerRef.current?.();

      return () => clearInterval(timer);
    }, []);

    return <ShimmerText {...args} shimmerControlRef={shimmerRef} />;
  },
  args: {
    text: 'Custom Styled Shimmer',
    baseTextClassName: 'text-gray-400',
    shimmerTextClassName: 'from-purple-400 to-pink-600',
  },
};

export const LongText: Story = {
  render: function Render(args) {
    const shimmerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      // Auto-trigger the animation when component mounts
      const timer = setInterval(() => {
        shimmerRef.current?.();
      }, 3000);

      // Initial trigger
      shimmerRef.current?.();

      return () => clearInterval(timer);
    }, []);

    return <ShimmerText {...args} shimmerControlRef={shimmerRef} />;
  },
  args: {
    text: 'This is a longer text that demonstrates how the shimmer effect works with multiple lines of text',
  },
};

export const WithAnimationControl: Story = {
  render: function Render(args) {
    const shimmerRef = useRef<(() => void) | null>(null);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleClick = () => {
      setIsAnimating(true);
      shimmerRef.current?.();

      // Reset animation state after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    };

    return (
      <div className='flex flex-col gap-4'>
        <ShimmerText {...args} shimmerControlRef={shimmerRef} />
        <button
          className={`w-fit rounded-md px-4 py-2 ${isAnimating ? 'bg-green-500' : 'bg-blue-500'} text-white`}
          onClick={handleClick}
          disabled={isAnimating}
        >
          {isAnimating ? 'Animating...' : 'Trigger Shimmer'}
        </button>
      </div>
    );
  },
  args: {
    text: 'Click the button to trigger shimmer',
  },
};

export const WithCustomGradient: Story = {
  render: function Render(args) {
    const shimmerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      // Auto-trigger the animation when component mounts
      const timer = setInterval(() => {
        shimmerRef.current?.();
      }, 3000);

      // Initial trigger
      shimmerRef.current?.();

      return () => clearInterval(timer);
    }, []);

    return (
      <ShimmerText
        {...args}
        shimmerControlRef={shimmerRef}
        shimmerTextClassName='[background-image:linear-gradient(90deg,transparent_0%,transparent_30%,#FF6B6B_50%,transparent_70%,transparent_100%)]'
      />
    );
  },
  args: {
    text: 'Custom Gradient Shimmer',
    baseTextClassName: 'text-gray-300',
  },
};
