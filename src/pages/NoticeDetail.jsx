import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNoticeById } from '../firebase/noticeApi';
import styles from './NoticeDetail.module.scss';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const NoticeDetail = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadNotice = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        setNotice(await getNoticeById(id));
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotice();
  }, [id]);

  return (
    <main className={styles.NoticeDetail}>
      <article className={styles.inner}>
        {isLoading ? (
          <p className={styles.stateMessage}>공지사항을 불러오는 중입니다.</p>
        ) : errorMessage ? (
          <p className={styles.errorMessage}>{errorMessage}</p>
        ) : !notice ? (
          <div className={styles.emptyState}>
            <strong>공지사항을 찾을 수 없습니다.</strong>
            <Link to="/notice">목록으로 이동</Link>
          </div>
        ) : (
          <>
            <header className={styles.detailHeader}>
              <p>NOTICE</p>
              <h1>{notice.title}</h1>
              <time>작성일 {formatDate(notice.createAt)}</time>
            </header>
            <div className={styles.content}>{notice.content}</div>
            <div className={styles.actions}>
              <Link to="/notice">목록</Link>
            </div>
          </>
        )}
      </article>
    </main>
  );
};

export default NoticeDetail;
