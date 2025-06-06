'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { LoginForm } from 'modules/login/LoginForm';
import { store } from '@/store';

export default function LoginPage() {
  return (
    <Provider store={store}>
      <LoginForm />
    </Provider>
  );
}
