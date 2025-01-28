import React from "react";
import { API_ENDPOINTS, REQUEST_TYPES } from "apis/apiEndpoint.constants";
import { API_DOMAIN } from "constants/api.constants";
import { LOGIN_PROVIDERS } from "constants/auth.constants";
import LocaldevEmailPasswordLogin from 'modules/login/LocaldevEmailPasswordLogin';
import { LoginFlow } from "types/api/auth.types";
import { SIZE_TYPES } from "types/common/components";
import { getDomainFromEmail, isValidEmail } from "utils/common";
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, removeFromLocalStorage, setToLocalStorage } from 'utils/localstorage';
import { Button } from "components/common/button/Button";
import Input from "components/common/input";

export const LoginFormV2 = () => {

    const [email, setEmail] = React.useState(getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL) ?? '');

    const [loginFlow, setLoginFlow] = React.useState<LoginFlow | null>(null);

    const [error, setError] = React.useState<string | null>(null);

    const [loading, setLoading] = React.useState<boolean>(false);

    const [oidcLoginMethod, setOidcLoginMethod] = React.useState<LOGIN_PROVIDERS | null>(null);

    console.log(oidcLoginMethod);


    const initiateOidcLogin = async (url: string, method: string, providerId: LOGIN_PROVIDERS) => {

        setOidcLoginMethod(providerId);

        try {
            const resp = await fetch(url, {
                method: method,
                body: JSON.stringify({
                    provider: providerId,
                }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            const respJson = await resp.json();

            if (resp.status === 422 || resp.status === 200) {
                setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL, email);

                const redirectUrl = respJson.redirect_browser_to;

                try {
                    const url = new URL(redirectUrl);
                    const emailDomain = getDomainFromEmail(email);

                    url.searchParams.set('hd', emailDomain);
                    window.location.href = url.toString();
                } catch (error) {
                    console.error(error);
                }

            } else {
                setLoginFlow(respJson);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setOidcLoginMethod(null);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');

            return;
        }

        try {
            const response = await fetch(`${API_DOMAIN}/${API_ENDPOINTS.AUTH_INITIAL_LOGIN_FLOW_BY_EMAIL_POST}`, {
                method: REQUEST_TYPES.POST,
                body: JSON.stringify({
                    email,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const respJson = await response.json();

            if (response.status !== 200) {
                setError(respJson.error);
                removeFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);

                return;
            }

            setLoginFlow(respJson);

            // if the number of login methods is 1 and it is OIDC, we can directly login
            if (respJson?.ui?.nodes?.length == 1) {
                const loginNode = respJson.ui.nodes[0];

                if (loginNode?.group === 'oidc') {
                    await initiateOidcLogin(respJson.ui.action, respJson.ui.method, loginNode.attributes.value as LOGIN_PROVIDERS);
                }
            }

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false);
        }

    };

    const inputDisabled = loading;

    if (loginFlow && loginFlow?.ui?.nodes?.length > 1) {
        return <LocaldevEmailPasswordLogin loginFlow={loginFlow} setLoginFlow={setLoginFlow} />
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F2F1ED]">
            <div className="w-full max-w-xs">
                <div className="bg-white shadow-md rounded p-8">
                    <div className="flex justify-center mb-6">
                        <div className="font-bold text-xl">zamp <i className="fas fa-equals"></i></div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Input
                                id='login-email'
                                label='Email'
                                placeholder='Enter your email address'
                                name='email'
                                type='email'
                                value={email}
                                onChange={(e) => {
                                    if (e?.target?.value !== undefined) {
                                        setEmail(e.target.value);
                                    }
                                }}
                                disabled={inputDisabled}
                            />
                        </div>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}asd</span>
                            </div>
                        )}
                        <Button
                            id='login'
                            className='w-full mt-4'
                            disabled={inputDisabled}
                            size={SIZE_TYPES.LARGE}

                            isLoading={loading ? loading : false}
                        >
                            <span className="f-16-500">Login</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );



};
