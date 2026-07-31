import React from 'react';
import { Link } from 'react-router-dom';
import styles from './EmptyMessage.module.scss';

// 목록에 보여줄 데이터가 없을 때 사용하는 공용 안내 컴포넌트입니다.
// 장바구니뿐 아니라 검색 결과 없음 등 다른 화면에서도 재사용할 수 있도록
// 이미지/제목/설명/이동 링크를 모두 props로 받습니다.
// props: image(안내 이미지 경로), title(제목), des(설명 문구), link(이동할 경로), linkText(버튼 텍스트)
const EmptyMessage = ({image, title, des, link, linkText}) => {
  return (
    <div className={styles.EmptyMessage}>
      <img src={image} alt="비었습니다" />
      <h3>{title}</h3>
      <p>{des}</p>
      {/* 예: 장바구니가 비었을 때 "상품 보러가기" 버튼으로 상품 목록 페이지로 이동 */}
      <Link to={link}>{linkText}</Link>
    </div>
  );
};

export default EmptyMessage;