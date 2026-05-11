import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { loginUser, registerUser, resendLoginCode, verifyLoginCode } from '../../../api/auth';
import './AuthPage.css';

const passwordPolicyHint =
  'От 10 до 30 символов, без пробелов, со строчной и заглавной буквой, цифрой и спецсимволом.';

function validatePasswordPolicy(value) {
  return (
    typeof value === 'string' &&
    value.length >= 10 &&
    value.length <= 30 &&
    !/\s/.test(value) &&
    /[a-zа-яё]/.test(value) &&
    /[A-ZА-ЯЁ]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-zА-Яа-яЁё0-9\s]/.test(value)
  );
}

const strengthLabels = ['Слабый', 'Нормальный', 'Хороший', 'Сильный'];

function getPasswordStrength(value) {
  if (!value) {
    return 0;
  }

  const hasLowercase = /[a-zа-яё]/.test(value);
  const hasUppercase = /[A-ZА-ЯЁ]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[^A-Za-zА-Яа-яЁё0-9\s]/.test(value);
  const hasNoSpaces = !/\s/.test(value);
  const classCount = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(Boolean).length;

  if (validatePasswordPolicy(value)) {
    return 3;
  }

  if (value.length >= 10 && hasNoSpaces && classCount >= 3) {
    return 2;
  }

  if (value.length >= 8 && classCount >= 2) {
    return 1;
  }

  return 0;
}

export function AuthPage({ onNavigate, onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [signinStep, setSigninStep] = useState('credentials');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loginChallengeId, setLoginChallengeId] = useState('');
  const [loginCodeHint, setLoginCodeHint] = useState('');
  const [resendAvailableAt, setResendAvailableAt] = useState('');
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupStrength = useMemo(
    () => getPasswordStrength(signupPassword),
    [signupPassword]
  );

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendSecondsLeft(0);
      return undefined;
    }

    const updateCountdown = () => {
      setResendSecondsLeft(
        Math.max(0, Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000))
      );
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [resendAvailableAt]);

  const navigate = path => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const resetSigninFlow = () => {
    setSigninStep('credentials');
    setMfaCode('');
    setLoginChallengeId('');
    setLoginCodeHint('');
    setResendAvailableAt('');
    setResendSecondsLeft(0);
    setAuthError('');
  };

  const handleSigninSubmit = async event => {
    event.preventDefault();
    setAuthError('');

    try {
      setIsSubmitting(true);

      if (signinStep === 'credentials') {
        const data = await loginUser(signinEmail, signinPassword);
        setLoginChallengeId(data.challengeId);
        setResendAvailableAt(data.resendAvailableAt || '');
        setSigninEmail(data.email || signinEmail);
        setMfaCode('');
        setSigninStep('mfa');
        setLoginCodeHint(
          data.demoCode
            ? `Код для локальной разработки: ${data.demoCode}`
            : 'Код подтверждения отправлен на вашу почту.'
        );
        return;
      }

      const data = await verifyLoginCode(loginChallengeId, mfaCode);
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      setSigninStep('done');
    } catch (error) {
      if (signinStep === 'credentials') {
        setAuthError('Не удалось начать вход. Проверьте почту и пароль.');
      } else if (error?.message === 'invalid_login_code') {
        const attemptsLeft = error?.payload?.attemptsLeft;
        setAuthError(
          typeof attemptsLeft === 'number'
            ? `Неверный код. Осталось попыток: ${attemptsLeft}.`
            : 'Неверный код подтверждения.'
        );
      } else if (error?.message === 'login_code_expired') {
        setAuthError('Срок действия кода истек. Запросите новый код.');
      } else {
        setAuthError('Не удалось подтвердить код. Повторите попытку.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!loginChallengeId) return;
    setAuthError('');
    try {
      setIsSubmitting(true);
      const data = await resendLoginCode(loginChallengeId);
      setResendAvailableAt(data.resendAvailableAt || '');
      setLoginCodeHint(
        data.demoCode
          ? `Новый код для локальной разработки: ${data.demoCode}`
          : 'Новый код подтверждения отправлен на вашу почту.'
      );
    } catch (error) {
      if (error?.message === 'login_code_resend_too_soon') {
        const retryAfter = error?.payload?.retryAfterSeconds;
        if (error?.payload?.resendAvailableAt) {
          setResendAvailableAt(error.payload.resendAvailableAt);
        }
        setAuthError(
          typeof retryAfter === 'number'
            ? `Повторно отправить код можно через ${retryAfter} с.`
            : 'Повторная отправка кода временно ограничена.'
        );
      } else if (error?.message === 'login_code_resend_limit_reached') {
        setAuthError('Лимит повторных отправок исчерпан. Повторите вход сначала.');
      } else {
        setAuthError('Не удалось отправить код повторно.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async event => {
    event.preventDefault();
    setAuthError('');
    if (!validatePasswordPolicy(signupPassword)) {
      setAuthError(passwordPolicyHint);
      return;
    }
    if (signupPassword !== signupConfirm) {
      setAuthError('Пароли не совпадают.');
      return;
    }
    try {
      setIsSubmitting(true);
      const data = await registerUser(signupEmail, signupPassword);
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      setMode('signin');
      setSigninStep('done');
    } catch {
      setAuthError('Не удалось создать аккаунт. Проверьте введенные данные.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__background" />
      <div className="auth-page__content">
        <button className="auth-page__back" onClick={() => navigate('/')}>
          <ArrowLeftIcon className="auth-page__backIcon" />
          Назад к лаборатории
        </button>

        <div className="auth-page__card glass-strong">
          <div className="auth-page__header">
            <div>
              <h1 className="auth-page__title">Secure Auth Center</h1>
              <p className="auth-page__subtitle">
                Двухэтапный вход с подтверждением по почте перед доступом в профиль.
              </p>
            </div>
            <div className="auth-page__badge">
              <ShieldCheckIcon className="auth-page__badgeIcon" />
              Почта + код
            </div>
          </div>

          <div className="auth-page__tabs">
            <button
              className={`auth-page__tab ${
                mode === 'signin' ? 'auth-page__tab--active' : ''
              }`}
              onClick={() => {
                setMode('signin');
                resetSigninFlow();
              }}
            >
              Вход
            </button>
            <button
              className={`auth-page__tab ${
                mode === 'signup' ? 'auth-page__tab--active' : ''
              }`}
              onClick={() => setMode('signup')}
            >
              Регистрация
            </button>
          </div>

          <div className="auth-page__body">
            {mode === 'signin' ? (
              <form className="auth-form" onSubmit={handleSigninSubmit}>
                {signinStep === 'credentials' && (
                  <>
                    <label className="auth-form__field">
                      <span>Email</span>
                      <div className="auth-form__inputWrap">
                        <MailIcon className="auth-form__icon" />
                        <input
                          type="email"
                          value={signinEmail}
                          onChange={e => setSigninEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </label>

                    <label className="auth-form__field">
                      <span>Пароль</span>
                      <div className="auth-form__inputWrap">
                        <LockIcon className="auth-form__icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={signinPassword}
                          onChange={e => setSigninPassword(e.target.value)}
                          placeholder="........"
                          required
                        />
                        <button
                          type="button"
                          className="auth-form__toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </label>

                    <button className="auth-form__submit" type="submit">
                      {isSubmitting ? 'Отправка кода...' : 'Продолжить'}
                    </button>
                  </>
                )}

                {signinStep === 'mfa' && (
                  <>
                    <div className="auth-form__mfa">
                      <h3>Подтверждение входа</h3>
                      <p>
                        Мы отправили 6-значный код на <strong>{signinEmail}</strong>. Введите его,
                        чтобы открыть свой профиль.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        required
                      />
                      {loginCodeHint && <div className="auth-form__hint">{loginCodeHint}</div>}
                    </div>

                    <div className="auth-form__actions">
                      <button className="auth-form__submit" type="submit">
                        {isSubmitting ? 'Проверка...' : 'Подтвердить вход'}
                      </button>
                      <button
                        className="auth-form__secondary"
                        type="button"
                        onClick={handleResendCode}
                        disabled={isSubmitting || resendSecondsLeft > 0}
                      >
                        <RefreshCwIcon />
                        {resendSecondsLeft > 0
                          ? `Повторно через ${resendSecondsLeft} с`
                          : 'Отправить код еще раз'}
                      </button>
                      <button
                        className="auth-form__secondary"
                        type="button"
                        onClick={resetSigninFlow}
                        disabled={isSubmitting}
                      >
                        Изменить почту или пароль
                      </button>
                    </div>
                  </>
                )}

                {signinStep === 'done' && (
                  <div className="auth-form__success">
                    <h3>Доступ разрешен</h3>
                    <p>Сессия активна. Теперь можно перейти в защищенную часть сайта.</p>
                    <button
                      className="auth-form__submit"
                      type="button"
                      onClick={() => navigate('/account')}
                    >
                      Открыть профиль
                    </button>
                  </div>
                )}

                {authError && <div className="auth-form__error">{authError}</div>}
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignupSubmit}>
                <label className="auth-form__field">
                  <span>Email</span>
                  <div className="auth-form__inputWrap">
                    <MailIcon className="auth-form__icon" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </label>

                <label className="auth-form__field">
                  <span>Пароль</span>
                  <div className="auth-form__inputWrap">
                    <LockIcon className="auth-form__icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Придумайте пароль"
                      required
                    />
                    <button
                      type="button"
                      className="auth-form__toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <div className="auth-form__strength">
                    <div className="auth-form__strengthBars">
                      {[0, 1, 2, 3].map(index => (
                        <span
                          key={index}
                          className={`auth-form__strengthBar ${
                            signupStrength >= index ? 'auth-form__strengthBar--active' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span>{strengthLabels[signupStrength]}</span>
                  </div>
                  <div className="auth-form__hint">{passwordPolicyHint}</div>
                </label>

                <label className="auth-form__field">
                  <span>Повторите пароль</span>
                  <div className="auth-form__inputWrap">
                    <LockIcon className="auth-form__icon" />
                    <input
                      type="password"
                      value={signupConfirm}
                      onChange={e => setSignupConfirm(e.target.value)}
                      placeholder="........"
                      required
                    />
                  </div>
                </label>

                <button className="auth-form__submit" type="submit">
                  {isSubmitting ? 'Создание аккаунта...' : 'Создать аккаунт'}
                </button>
                {authError && <div className="auth-form__error">{authError}</div>}
              </form>
            )}

            <div className="auth-page__security">
              <h3>Почему это безопаснее</h3>
              <ul>
                <li>Сначала проверяется пароль, но профиль не откроется без кода из письма.</li>
                <li>Каждый код живет ограниченное время и имеет лимит попыток ввода.</li>
                <li>Повторная отправка генерирует новый код и делает старый недействительным.</li>
                <li>Журнал безопасности фиксирует вход, отправку кода и ошибки подтверждения.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="auth-page__footer glass">
          Secure by Design: вход в профиль теперь требует пароль и одноразовый код из почты.
        </div>
      </div>
    </div>
  );
}
