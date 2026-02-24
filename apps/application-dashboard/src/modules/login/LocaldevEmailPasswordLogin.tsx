'use client';
import { FC, FormEvent, MouseEvent, useEffect, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { useGetErrorDetailsQuery } from 'apis/auth';
import { LOGIN_METHODS } from 'constants/auth.constants';
import { ArrowRight } from 'lucide-react';
import { LOGIN_ERROR_TEXT } from 'modules/login/constants';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginFlow } from 'types/api/auth.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import Input from 'components/common/input';

type LoginFormProps = {
  className?: string;
  loginFlow: LoginFlow;
  setLoginFlow: (loginFlow: LoginFlow) => void;
};

const commonFetchConfig = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

const LoginForm: FC<LoginFormProps> = ({ className = '', loginFlow, setLoginFlow }) => {
  const cachedUserEmail = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER) ?? '{}');
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorId = searchParams?.get('error')?.toString() ?? '';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLogin, setIsEmailLogin] = useState<boolean>(false);

  const { data: userFacingError } = useGetErrorDetailsQuery(errorId, { skip: !errorId });

  const [email, setEmail] = useState<string>(cachedUserEmail.email ?? '');
  const [password, setPassword] = useState<string>(cachedUserEmail.password ?? '');

  const handlePasswordSubmit = (e?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
    setIsEmailLogin(true);
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
        csrfToken = csrfNode.attributes.value ?? '';
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
            setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER, JSON.stringify({ email, password }));

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
    const token = localStorage.getItem('token');

    if (token) {
      router.push('/payments');
    }
  }, []);

  const formDisabled = loading || !loginFlow;

  return (
    <div className={`mx-auto mt-10 flex w-full flex-col items-center gap-10 ${className}`}>
      {userFacingError &&
        userFacingError.map((error, index) => (
          <div key={index} className='text-red-600'>
            {error.message}
          </div>
        ))}
      <form className='flex w-full flex-col gap-3' onSubmit={handlePasswordSubmit}>
        <Input
          id='login-email'
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
          id='login-password'
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
          testId='login'
          className='w-fit'
          disabled={formDisabled}
          trailingIcon={<ArrowRight size={16} />}
          isLoading={isEmailLogin ? loading : false}
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
