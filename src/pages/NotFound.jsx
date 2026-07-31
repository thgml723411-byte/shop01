import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
  return (
    <main className={styles.NotFound}>
      <section className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1>길을 잃은 꽃잎이에요</h1>
        <p className={styles.message}>
          찾으시는 페이지가 아직 피어나지 않았어요.
          주소를 다시 확인하거나 다른 꽃을 둘러보세요.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to="/">
            홈으로
          </Link>
          <Link className={styles.secondary} to="/products">
            전체상품 보기
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
