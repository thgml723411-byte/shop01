import AdminLayout from '../components/AdminLayout';
import styles from './Admin.module.scss';

const AdminPlaceholder = ({ title, label }) => {
  return (
    <AdminLayout title={title}>
      <div className={styles.panelBox}>
        <strong>{label}</strong>
        <p>해당 관리 기능을 연결할 영역입니다.</p>
        <span>이번 단계에서는 회원관리 기능만 Firestore와 연결했습니다.</span>
      </div>
    </AdminLayout>
  );
};

export default AdminPlaceholder;
