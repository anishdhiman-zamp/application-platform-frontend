'use client';
import React from 'react';
import { HandleInvitations } from 'modules/invitations';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return <HandleInvitations />;
};

export default Home;
