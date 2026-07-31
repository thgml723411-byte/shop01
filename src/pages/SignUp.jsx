import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './SignUp.module.scss';

const SignUp = () => {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signUp(form.email, form.password, form.nickname.trim());
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.SignUp}>
      <section className={styles.authBox}>
        <div className={styles.titleArea}>
          <p>SIGN UP</p>
          <h2>회원가입</h2>
          <span>꽃 선물을 위한 계정을 만들어보세요</span>
        </div>

        <form className={styles.authForm} onSubmit={submitSignUp}>
          <label>
            <span>닉네임</span>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={changeForm}
              placeholder="닉네임"
              autoComplete="nickname"
              required
            />
          </label>

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
              placeholder="6자 이상 입력"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className={styles.linkText}>
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  );
};

export default SignUp;
