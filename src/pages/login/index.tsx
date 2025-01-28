'use client';
import React from 'react';
import { LoginFormV2 } from 'modules/login/LoginFormV2';
// import LoginForm from 'modules/login/LoginForm';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return <LoginFormV2 />;
};

export default Home;
