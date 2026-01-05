'use client';

import React, { useEffect, useRef } from 'react';

export interface AudioVisualizerProps {
  microphone: MediaRecorder;
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
  frameSkip?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  microphone,
  barCount = 40,
  minHeight = 8,
  maxHeight = 200,
  frameSkip = 2,
  className = 'flex h-5 flex-1 items-center justify-center gap-[2px] overflow-hidden',
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const historyBufferRef = useRef<number[]>(new Array(barCount).fill(0));
  const frameCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!microphone) {
      // Reset to idle state
      historyBufferRef.current = new Array(barCount).fill(0);
      frameCounterRef.current = 0;
      barsRef.current.forEach((bar) => {
        if (bar) {
          bar.style.height = `${minHeight}px`;
          bar.style.opacity = '0.6';
        }
      });

      return;
    }

    // Set up audio analysis
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(microphone.stream);

    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Get average of frequency data for the current frame
      const samples = barCount;
      const step = Math.floor(bufferLength / samples);
      let sum = 0;

      for (let i = 0; i < samples; i++) {
        sum += dataArray[i * step];
      }
      const average = sum / samples / 255; // Normalize to 0-1

      // Increment frame counter
      frameCounterRef.current += 1;

      // Only shift buffer every frameSkip frames
      if (frameCounterRef.current >= frameSkip) {
        frameCounterRef.current = 0;
        historyBufferRef.current.shift();
        historyBufferRef.current.push(average);
      }

      // Update bars with buffered values
      for (let i = 0; i < samples; i++) {
        const bar = barsRef.current[i];

        if (!bar) continue;

        const value = historyBufferRef.current[i];
        const height = Math.max(minHeight, value * maxHeight);
        const opacity = 0.7 + value * 0.3;

        bar.style.height = `${height}%`;
        bar.style.opacity = opacity.toString();
      }

      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [microphone, barCount, minHeight, maxHeight, frameSkip]);

  return (
    <div className={className}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) {
              barsRef.current[index] = el;
            }
          }}
          className='w-1 rounded-full bg-black'
          style={{
            height: `${minHeight}px`,
            opacity: 0.6,
            transition: 'height 0.05s ease-out, opacity 0.05s ease-out',
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
