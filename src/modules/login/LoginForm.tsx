'use client';
import React, { useEffect, useState } from 'react';
import { useGetErrorDetailsQuery, useInitiateLoginFlowQuery } from 'apis/auth';
import { LOGIN_METHODS, LOGIN_PROVIDERS } from 'constants/auth.constants';
import { GOOGLE_ICON, ICON_SPRITE_TYPES, ZAMP_ICON_BLACK } from 'constants/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { LoginFlow } from 'types/api/auth.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';

const LOGIN_ERROR_TEXT = 'Unable to login, please try again.';

type LoginFormProps = {
  className?: string;
};

const commonFetchConfig = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

const LoginForm: React.FC<LoginFormProps> = ({ className = '' }) => {
  const router = useRouter();
  const errorId = router.query.error?.toString() ?? '';

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [loginFlow, setLoginFlow] = React.useState<LoginFlow | null>(null);

  const { data: initiatedLoginFlow, isLoading } = useInitiateLoginFlowQuery();
  const { data: userFacingError } = useGetErrorDetailsQuery(errorId, { skip: !errorId });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleGoogleClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.();
    if (loginFlow) {
      setLoading(true);
      fetch(loginFlow.ui.action, {
        ...commonFetchConfig,
        method: loginFlow.ui.method,
        credentials: 'include',
        body: JSON.stringify({
          provider: LOGIN_PROVIDERS.GOOGLE,
        }),
      })
        .then((response) => {
          return response.json().then((responseJson) => {
            if (response.status === 422) {
              if (responseJson.redirect_browser_to) {
                window.location.href = responseJson.redirect_browser_to;
              }
            } else if (response.status == 400) {
              setLoginFlow(responseJson);
            }
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handlePasswordSubmit = (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e?.preventDefault?.();
    if (loginFlow) {
      setLoading(true);

      const csrfNode = loginFlow.ui.nodes.find((node) => {
        const nodeAttributes = node.attributes;

        if ('name' in nodeAttributes && nodeAttributes['name'] === 'csrf_token') {
          return true;
        }

        return false;
      });
      let csrfToken = '';

      if (csrfNode && 'value' in csrfNode.attributes) {
        csrfToken = csrfNode.attributes.value;
      }

      fetch(loginFlow.ui.action, {
        ...commonFetchConfig,
        method: loginFlow.ui.method,
        credentials: 'include',
        body: JSON.stringify({
          password: password,
          csrf_token: csrfToken,
          method: LOGIN_METHODS.PASSWORD,
          identifier: email,
        }),
      }).then((response) => {
        return response
          .json()
          .then((responseJson) => {
            if (response.status < 300) {
              window.location.reload();

              return;
            }
            if (response.status === 400) {
              setLoginFlow(responseJson);
              setError(responseJson?.ui?.messages?.[0]?.text ?? LOGIN_ERROR_TEXT);
              setLoading(false);
            }
          })
          ?.catch(() => {
            setError(LOGIN_ERROR_TEXT);
          });
      });
    }
  };

  useEffect(() => {
    if (initiatedLoginFlow) {
      setLoginFlow(initiatedLoginFlow);
    }
  }, [initiatedLoginFlow]);

  const formDisabled = loading || isLoading || !loginFlow;

  return (
    <div className={`w-96 mx-auto mt-[30vh] items-center flex flex-col gap-10 ${className}`}>
      <Image src={ZAMP_ICON_BLACK} width={48} height={48} alt='Zamp' />

      {userFacingError &&
        userFacingError.map((error, index) => (
          <div key={index} className='text-red-600'>
            {error.message}
          </div>
        ))}
      <form className='flex flex-col gap-3 w-full' onSubmit={handlePasswordSubmit}>
        <Input
          testId='login-email'
          label='Email'
          required
          placeholder='Enter your email'
          name='email'
          type='email'
          value={email}
          onChange={(e) => {
            if (e?.target?.value !== undefined) {
              setEmail(e.target.value);
            }
          }}
          disabled={formDisabled}
        />
        <Input
          testId='login-password'
          label='Password'
          required
          disabled={formDisabled}
          placeholder='Enter your password'
          type='password'
          name='password'
          value={password}
          onChange={(e) => {
            if (e?.target?.value !== undefined) {
              setPassword(e.target.value);
            }
          }}
          error={error ?? ''}
        />
        <Button
          id='login'
          className='w-fit'
          disabled={formDisabled}
          size={SIZE_TYPES.LARGE}
          iconProps={{
            id: 'arrow-right',
            iconCategory: ICON_SPRITE_TYPES.ARROWS,
          }}
          isLoading={loading}
        >
          Login
        </Button>
      </form>
      <Button
        id='google-login'
        type={BUTTON_TYPES.TEXT_NAV}
        disabled={formDisabled}
        onClick={handleGoogleClick}
        isLoading={loading}
      >
        <Image src={GOOGLE_ICON} width={32} height={32} alt='Zamp' />
      </Button>
    </div>
  );
};

export default LoginForm;
