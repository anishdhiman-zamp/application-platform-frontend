'use client';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Agentation as AgentationToolbar } from 'agentation';

const Agentation = () => {
  if (process.env.NODE_ENV === 'production') return null;

  return <AgentationToolbar />;
};

export default Agentation;
