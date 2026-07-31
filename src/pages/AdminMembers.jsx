import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminMembers } from '../firebase/adminMemberApi';
import styles from './Admin.module.scss';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const memberData = await getAdminMembers();
        setMembers(memberData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  return (
    <AdminLayout title="회원관리">
      {isLoading ? (
        <p className={styles.stateMessage}>회원 목록을 불러오는 중입니다.</p>
      ) : errorMessage ? (
        <p className={styles.errorMessage}>{errorMessage}</p>
      ) : members.length === 0 ? (
        <div className={styles.panelBox}>
          <strong>회원 정보가 없습니다</strong>
          <p>아직 가입된 회원 문서가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>닉네임</th>
                <th>이메일</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.nickname || '회원'}</td>
                  <td>{member.email || '-'}</td>
                  <td>{formatDate(member.createAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMembers;
