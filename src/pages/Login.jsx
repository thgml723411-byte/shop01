import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './Login.module.scss';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.Login}>
      <section className={styles.authBox}>
        <div className={styles.titleArea}>
          <p>LOGIN</p>
          <h2>로그인</h2>
          <span>이메일과 비밀번호로 로그인하세요</span>
        </div>

        <form className={styles.authForm} onSubmit={submitLogin}>
          <label>
            <span>이메일</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={changeForm}
              placeholder="email@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={changeForm}
              placeholder="비밀번호"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className={styles.linkText}>
          아직 계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
