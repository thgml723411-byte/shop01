import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';
import { useAuthStore } from '../store/authStore';
import styles from './Header.module.scss';

const Header = () => {
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userProfile = useAuthStore((state) => state.userProfile);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <header className={styles.Header}>
      <div className={styles.inner}>
        <Link className={styles.logo} to="/">
          <img src="/img/logo/logo-minimal-leaf-cut.png" alt="" />
          <span>fire shopping</span>
        </Link>
        <SearchBox />
        <nav className={styles.memberNav}>
          {isLoggedIn ? (
            <>
              <span className={styles.userName}>{userProfile?.nickname || '회원'}님</span>
              <Link to="/mypage">마이페이지</Link>
              {isAdmin && <Link to="/admin">관리자</Link>}
              <button type="button" className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
          <Link to="/wishlist">찜</Link>
          <Link to="/cart">장바구니</Link>
        </nav>
      </div>
      <nav className={styles.categoryNav}>
        <div className={styles.categoryList}>
          <Link to="/products">전체상품</Link>
          <Link to="/products/category/glass-basket">글라스바스켓</Link>
          <Link to="/products/category/long-wrap">롱랩부케</Link>
          <Link to="/products/category/deco-flower">데코플라워</Link>
          <Link to="/products/category/message-card">메시지카드</Link>
          <Link to="/notice">공지사항</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;

