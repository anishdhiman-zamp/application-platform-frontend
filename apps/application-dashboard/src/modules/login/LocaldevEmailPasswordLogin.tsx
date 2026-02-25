'use client';
import { FC, FormEvent, useState } from 'react';
import { Button } from '@zamp-platform/ui';
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
  const cachedUserEmail = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER) ?? '{}');
  const searchParams = useSearchParams();
  const errorId = searchParams?.get('error')?.toString() ?? '';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: userFacingError } = useGetErrorDetailsQuery(errorId, { skip: !errorId });

  const [email, setEmail] = useState(cachedUserEmail.email ?? '');
  const [password, setPassword] = useState(cachedUserEmail.password ?? '');

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
  const inputBase =
    'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1a1a1a] transition-all duration-250 outline-none placeholder:text-[#bbb]';
  const inputNormal = 'border-black/10 focus:border-black/25 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]';
  const inputError =
    'border-[#e53935] shadow-[0_0_0_3px_rgba(229,57,53,0.08)] focus:border-[#e53935] focus:shadow-[0_0_0_3px_rgba(229,57,53,0.12)]';

  return (
    <div>
      {userFacingError?.map((err, index) => (
        <p key={index} className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-[#e53935]'>
          {err.message}
        </p>
      ))}

      <form onSubmit={handlePasswordSubmit}>
        <Input
          label='Email'
          labelOverrideClassName='mb-2 block text-[13px] font-medium text-[#666]'
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
          inputClassName={`${inputBase} ${inputNormal}`}
          focusClassNames=''
          inputRoundedClassName=''
        />

        <div className='mb-5'>
          <Input
            label='Password'
            labelOverrideClassName='mb-2 block text-[13px] font-medium text-[#666]'
            id='login-password'
            placeholder='Enter your password'
            name='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={formDisabled}
            noBorders
            customPaddingClassName='px-3.5 py-3'
            inputClassName={`${inputBase} ${error ? inputError : inputNormal}`}
            focusClassNames=''
            inputRoundedClassName=''
          />
          {error && <p className='mt-1.5 text-xs text-[#e53935]'>{error}</p>}
        </div>

        <Button
          type='submit'
          data-testid='login'
          disabled={formDisabled || !email.trim() || !password}
          className={`group relative mt-1 h-auto w-full overflow-hidden rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-250 ${
            !(formDisabled || !email.trim() || !password)
              ? 'cursor-pointer border-black/10 bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] active:scale-[0.98] active:bg-[#1a1a1a]'
              : 'cursor-not-allowed border-black/3 bg-[#d0d0d0] text-[#999] disabled:bg-[#d0d0d0] disabled:text-[#999]'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
