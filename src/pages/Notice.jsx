import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotices } from '../firebase/noticeApi';
import styles from './Notice.module.scss';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadNotices = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        setNotices(await getNotices());
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotices();
  }, []);

  return (
    <main className={styles.Notice}>
      <section className={styles.inner}>
        <header className={styles.pageHeader}>
          <p>NOTICE</p>
          <h1>공지사항</h1>
        </header>

        {isLoading ? (
          <p className={styles.stateMessage}>공지사항을 불러오는 중입니다.</p>
        ) : errorMessage ? (
          <p className={styles.errorMessage}>{errorMessage}</p>
        ) : notices.length === 0 ? (
          <p className={styles.emptyMessage}>등록된 공지사항이 없습니다.</p>
        ) : (
          <div className={styles.noticeList}>
            <div className={styles.listHeader} aria-hidden="true">
              <span>제목</span>
              <span>작성일</span>
            </div>
            {notices.map((notice) => (
              <Link key={notice.id} className={styles.noticeItem} to={`/notice/${notice.id}`}>
                <strong>{notice.title}</strong>
                <time>{formatDate(notice.createAt)}</time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Notice;
