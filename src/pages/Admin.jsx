import AdminLayout from '../components/AdminLayout';
import styles from './Admin.module.scss';

const Admin = () => {
  return (
    <AdminLayout title="관리자 대시보드">
      <div className={styles.panelBox}>
        <strong>대시보드</strong>
        <p>쇼핑몰 운영 현황을 확인하는 관리자 기본 화면입니다.</p>
        <span>관리자 비밀번호 변경은 마이페이지의 회원 정보 수정 영역에서 진행합니다.</span>
      </div>
    </AdminLayout>
  );
};

export default Admin;
