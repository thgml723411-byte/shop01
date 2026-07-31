import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles['site-footer']}>
      <div className={styles['footer-container']}>
        {/* 상단: 브랜드 로고 & 주요 카테고리 */}
        <div className={styles['footer-top']}>
          <div className={styles['footer-brand']}>
            <a href="/" className={styles['footer-logo']}>
              <span className={styles['footer-logo-icon']}></span>
              BLUE FLAX FLORIST
            </a>
            <span className={styles['footer-tagline']}>
              일상에 특별함을 더하는 감성 플라워 큐레이션
            </span>
          </div>

          <div className={styles['footer-nav-groups']}>
            <div className={styles['footer-nav-col']}>
              <span className={styles['footer-nav-title']}>SHOP</span>
              <a href="/products">전체상품</a>
              <a href="/category/glass-basket">글라스바스켓</a>
              <a href="/category/bouquet">롱튤립부케</a>
              <a href="/category/deco">데코플라워</a>
            </div>
            <div className={styles['footer-nav-col']}>
              <span className={styles['footer-nav-title']}>HELP</span>
              <a href="/notice">공지사항</a>
              <a href="/faq">자주 묻는 질문</a>
              <a href="/contact">1:1 문의</a>
              <a href="/shipping">배송 안내</a>
            </div>
            <div className={styles['footer-nav-col']}>
              <span className={styles['footer-nav-title']}>ABOUT</span>
              <a href="/about">브랜드 스토리</a>
              <a href="/showroom">오프라인 쇼룸</a>
              <a href="/b2b">기업 제휴</a>
            </div>
          </div>
        </div>

        {/* 중단: 사업자 정보 & CS 센터 */}
        <div className={styles['footer-middle']}>
          <div className={styles['company-info']}>
            <p>(주)블루플랙스플로리스트 | 대표자: 홍길동 | 사업자등록번호: 000-00-00000</p>
            <p>통신판매업신고: 2026-서울강남-0000호 | 주소: 서울특별시 강남구 도산대로 123 2층</p>
            <div className={styles['company-info-links']}>
              <a href="/terms">이용약관</a>
              <a href="/privacy">개인정보처리방침</a>
              <a href="/business-info">사업자정보확인</a>
            </div>
          </div>

          <div className={styles['cs-center']}>
            <div className={styles['cs-number']}>1588-0000</div>
            <div className={styles['cs-hours']}>
              MON - FRI 10:00 - 18:00 (LUNCH 12:30 - 13:30)<br />
              WEEKEND & HOLIDAY OFF
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 카피라이트 & 소셜 링크 */}
      <div className={styles['footer-bottom']}>
        <div className={styles['footer-bottom-inner']}>
          <span>© 2026 BLUE FLAX FLORIST. ALL RIGHTS RESERVED.</span>
          <div className={styles['social-icons']}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM</a>
            <a href="https://kakao.com" target="_blank" rel="noreferrer">KAKAO</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer">PINTEREST</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
