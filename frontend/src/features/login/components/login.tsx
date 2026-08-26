import { LoadingOverlay, Textbox } from '@/components';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

type PropsType = {
    errMessage: string,
    isLoading: boolean,
    register: UseFormRegister<{
        name: string;
        password: string;
    }>,
    errors: FieldErrors<{
        name: string;
        password: string;
    }>,
    clickLogin: (e?: React.BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>,
    navigateSignup(): void,
    handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void,
    back(): void,
}

export function Login(props: PropsType) {

    const {
        errMessage,
        isLoading,
        register,
        errors,
        clickLogin,
        navigateSignup,
        handleKeyPress,
        back,
    } = props;

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
            {isLoading && <LoadingOverlay />}
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 sm:p-10">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
                    ログイン
                </h1>
                {errMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 mb-6">
                        {errMessage}
                    </div>
                )}
                <div className="flex flex-col gap-6">
                    {/* ユーザー名 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ユーザー名
                        </label>
                        <Textbox
                            className={`w-full h-12 px-4 rounded-lg border-gray-300 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            autoComplete="off"
                            registration={register("name")}
                            onKeyDown={handleKeyPress}
                        />
                        {errors.name?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>
                        )}
                    </div>
                    {/* パスワード */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <Textbox
                            className={`w-full h-12 px-4 rounded-lg border-gray-300 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="password"
                            autoComplete="off"
                            registration={register("password")}
                            onKeyDown={handleKeyPress}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <span
                            className='text-blue-700 cursor-pointer'
                            onClick={navigateSignup}
                        >
                            アカウント作成はこちらから
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            type="button"
                            className="flex-1 border-2 border-accent/30 bg-surface hover:bg-canvas text-ink-sub font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={back}
                        >
                            戻る
                        </button>
                        <button
                            type="button"
                            className="flex-1 bg-accent hover:bg-accent-hover text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={clickLogin}
                        >
                            ログイン
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
