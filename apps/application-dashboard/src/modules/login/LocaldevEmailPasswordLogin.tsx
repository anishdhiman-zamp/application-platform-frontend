'use client';
import { FC, FormEvent, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useGetErrorDetailsQuery } from 'apis/auth';
import { LOGIN_METHODS } from 'constants/auth.constants';
import { LOGIN_ERROR_TEXT } from 'modules/login/constants';
import { useSearchParams } from 'next/navigation';
import { LoginFlow } from 'types/api/auth.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import Input from 'components/common/input';

type LoginFormProps = {
  loginFlow: LoginFlow;
  setLoginFlow: (loginFlow: LoginFlow) => void;
};

const LoginForm: FC<LoginFormProps> = ({ loginFlow, setLoginFlow }) => {
  const searchParams = useSearchParams();
  const errorId = searchParams?.get('error')?.toString() ?? '';
  const cachedUserEmail = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER) ?? '{}');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(cachedUserEmail.email ?? '');
  const [password, setPassword] = useState(cachedUserEmail.password ?? '');

  const { data: userFacingError } = useGetErrorDetailsQuery(errorId, { skip: !errorId });

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginFlow) return;

    setLoading(true);
    setError(null);

    const csrfNode = loginFlow.ui.nodes.find(
      (node) => 'name' in node.attributes && node.attributes.name === 'csrf_token',
    );
    const csrfToken = csrfNode && 'value' in csrfNode.attributes ? (csrfNode.attributes.value ?? '') : '';

    try {
      const response = await fetch(loginFlow.ui.action, {
        method: loginFlow.ui.method,
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          csrf_token: csrfToken,
          method: LOGIN_METHODS.PASSWORD,
          identifier: email,
        }),
      });
      const responseJson = await response.json();

      setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER, JSON.stringify({ email, password }));

      if (response.status < 300) {
        window.location.reload();

        return;
      }
      if (response.status === 400) {
        setLoginFlow(responseJson);
        setError(responseJson?.ui?.messages?.[0]?.text ?? LOGIN_ERROR_TEXT);
      }
      setLoading(false);
    } catch {
      setError(LOGIN_ERROR_TEXT);
      setLoading(false);
    }
  };

  const formDisabled = loading || !loginFlow;

  return (
    <div>
      {userFacingError?.map((err, index) => (
        <p key={index} className='bg-RED_100 text-RED_600 mb-4 rounded-lg px-3 py-2 text-xs'>
          {err?.message}
        </p>
      ))}

      <form onSubmit={handlePasswordSubmit}>
        <Input
          label='Email'
          labelOverrideClassName='mb-2 block text-[13px] font-medium text-GRAY_900'
          className='mb-4'
          id='login-email'
          placeholder='Enter your email'
          name='email'
          type='email'
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          disabled={formDisabled}
          noBorders
          customPaddingClassName='px-3.5 py-3'
          inputClassName='w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-GRAY_1000 transition-all duration-250 outline-none placeholder:text-GRAY_500 focus:border-black/25 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]'
          focusClassNames=''
          inputRoundedClassName=''
        />

        <div className='mb-5'>
          <Input
            label='Password'
            labelOverrideClassName='mb-2 block text-[13px] font-medium text-GRAY_900'
            id='login-password'
            placeholder='Enter your password'
            name='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={formDisabled}
            noBorders
            customPaddingClassName='px-3.5 py-3'
            inputClassName={cn(
              'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-GRAY_1000 transition-all duration-250 outline-none placeholder:text-GRAY_500',
              error
                ? 'border-RED_600 shadow-[0_0_0_3px_rgba(220,38,38,0.08)] focus:border-RED_600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]'
                : 'border-black/10 focus:border-black/25 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]',
            )}
            focusClassNames=''
            inputRoundedClassName=''
          />
          {error && <p className='text-RED_600 mt-1.5 text-xs'>{error}</p>}
        </div>

        <Button
          type='submit'
          data-testid='login'
          disabled={formDisabled || !email.trim() || !password}
          className={cn(
            'group relative mt-1 h-auto w-full overflow-hidden rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-250',
            !(formDisabled || !email.trim() || !password)
              ? 'bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_1000 cursor-pointer border-black/10 text-white active:scale-[0.98]'
              : 'bg-GRAY_500 text-GRAY_700 disabled:bg-GRAY_500 disabled:text-GRAY_700 cursor-not-allowed border-black/3',
          )}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
