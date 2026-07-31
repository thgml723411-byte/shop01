import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  createNotice,
  deleteNotice,
  getNotices,
  updateNotice,
} from '../firebase/noticeApi';
import styles from './Admin.module.scss';

const initialForm = {
  title: '',
  content: '',
};

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

const AdminNotices = () => {
  const formRef = useRef(null);
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    loadNotices();
  }, []);

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
  };

  const startEdit = (notice) => {
    setForm({
      title: notice.title || '',
      content: notice.content || '',
    });
    setEditingId(notice.id);
    setMessage('');
    setErrorMessage('');
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const submitNotice = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      if (editingId) {
        await updateNotice(editingId, form);
        setMessage('공지사항이 수정되었습니다.');
      } else {
        await createNotice(form);
        setMessage('공지사항이 등록되었습니다.');
      }

      resetForm();
      await loadNotices();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeNotice = async (noticeId) => {
    const answer = window.confirm('이 공지사항을 삭제하시겠습니까?');
    if (!answer) return;

    setMessage('');
    setErrorMessage('');

    try {
      await deleteNotice(noticeId);
      if (editingId === noticeId) resetForm();
      setMessage('공지사항이 삭제되었습니다.');
      await loadNotices();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <AdminLayout title="공지사항관리">
      {message && <p className={styles.successMessage}>{message}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      {isLoading ? (
        <p className={styles.stateMessage}>공지사항 목록을 불러오는 중입니다.</p>
      ) : notices.length === 0 ? (
        <div className={styles.panelBox}>
          <strong>등록된 공지사항이 없습니다</strong>
          <p>아래 작성 영역에서 첫 공지사항을 등록할 수 있습니다.</p>
        </div>
      ) : (
        <div className={styles.noticeAdminList}>
          {notices.map((notice) => (
            <article key={notice.id} className={styles.noticeAdminItem}>
              <div className={styles.noticeAdminInfo}>
                <strong>{notice.title}</strong>
                <span>
                  작성 {formatDate(notice.createAt)} · 수정 {formatDate(notice.updatedAt)}
                </span>
              </div>
              <div className={styles.itemActions}>
                <button type="button" onClick={() => startEdit(notice)}>수정</button>
                <button type="button" onClick={() => removeNotice(notice.id)}>삭제</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <form ref={formRef} className={styles.noticeForm} onSubmit={submitNotice}>
        <label>
          <span>제목</span>
          <input
            name="title"
            value={form.title}
            onChange={changeForm}
            maxLength="120"
            required
          />
        </label>
        <label>
          <span>내용</span>
          <textarea
            name="content"
            value={form.content}
            onChange={changeForm}
            rows="12"
            required
          />
        </label>
        <div className={styles.formActions}>
          <button type="submit" disabled={isSaving}>
            {isSaving ? '저장 중...' : editingId ? '공지사항 수정' : '공지사항 등록'}
          </button>
          {editingId && <button type="button" onClick={resetForm}>수정 취소</button>}
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminNotices;
