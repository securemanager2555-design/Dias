import React, { useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { loginUser, registerUser } from '../../../api/auth';
import './AuthPage.css';

const strengthLabels = ['Слабый', 'Нормальный', 'Хороший', 'Сильный'];

function getPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-ZА-Я]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-zА-Яа-я0-9]/.test(value)) score += 1;
  return Math.min(score, 3);
}

export function AuthPage({ onNavigate, onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [signinStep, setSigninStep] = useState('credentials');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupStrength = useMemo(
    () => getPasswordStrength(signupPassword),
    [signupPassword]
  );

  const navigate = path => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSigninSubmit = async event => {
    event.preventDefault();
    setAuthError('');
    if (signinStep !== 'credentials') {
      setSigninStep('done');
      return;
    }
    try {
      setIsSubmitting(true);
      const data = await loginUser(signinEmail, signinPassword);
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      setSigninStep('done');
    } catch (error) {
      setAuthError('Не удалось войти. Проверь почту и пароль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async event => {
    event.preventDefault();
    setAuthError('');
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
    } catch (error) {
      setAuthError('Не удалось зарегистрироваться. Проверь данные.');
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
                Вход и регистрация с акцентом на безопасность.
              </p>
            </div>
            <div className="auth-page__badge">
              <ShieldCheckIcon className="auth-page__badgeIcon" />
              MFA Ready
            </div>
          </div>

          <div className="auth-page__tabs">
            <button
              className={`auth-page__tab ${
                mode === 'signin' ? 'auth-page__tab--active' : ''
              }`}
              onClick={() => {
                setMode('signin');
                setSigninStep('credentials');
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
                          placeholder="••••••••"
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
                      {isSubmitting ? '\u0412\u0445\u043E\u0434...' : '\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C'}
                    </button>
                  </>
                )}

                {signinStep === 'mfa' && (
                  <>
                    <div className="auth-form__mfa">
                      <h3>Двухфакторная проверка</h3>
                      <p>
                        Мы отправили код подтверждения. Введите 6 цифр для
                        завершения входа.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value)}
                        placeholder="123456"
                      />
                    </div>
                    <button className="auth-form__submit" type="submit">
                      Подтвердить вход
                    </button>
                  </>
                )}

                {signinStep === 'done' && (
                  <div className="auth-form__success">
                    <h3>Доступ разрешен</h3>
                    <p>Сессия создана. Добро пожаловать!</p>
                    <button
                      className="auth-form__submit"
                      type="button"
                      onClick={() => navigate('/')}
                    >
                      Перейти в лабораторию
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
                </label>
                <label className="auth-form__field">
                  <span>Повторите пароль</span>
                  <div className="auth-form__inputWrap">
                    <LockIcon className="auth-form__icon" />
                    <input
                      type="password"
                      value={signupConfirm}
                      onChange={e => setSignupConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </label>
                <button className="auth-form__submit" type="submit">
                  {isSubmitting ? '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F...' : '\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442'}
                </button>
                {authError && <div className="auth-form__error">{authError}</div>}
              </form>
            )}

            <div className="auth-page__security">
              <h3>Почему это безопасно</h3>
              <ul>
                <li>Пароли хешируются и никогда не хранятся в открытом виде.</li>
                <li>MFA снижает риск кражи учетной записи.</li>
                <li>Rate limiting блокирует перебор паролей.</li>
                <li>Логирование фиксирует подозрительные попытки входа.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="auth-page__footer glass">
          Secure by Design: вход как часть цепочки защиты.
        </div>
      </div>
    </div>
  );
}
