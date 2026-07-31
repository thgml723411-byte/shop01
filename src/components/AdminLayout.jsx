import { NavLink } from 'react-router-dom';
import styles from '../pages/Admin.module.scss';

const adminMenus = [
  { path: '/admin', label: '대시보드', end: true },
  { path: '/admin/members', label: '회원관리' },
  { path: '/admin/products', label: '상품관리(재고관리)' },
  { path: '/admin/recommended', label: '추천상품관리' },
  { path: '/admin/notices', label: '공지사항관리' },
];

const AdminLayout = ({ title, children }) => {
  return (
    <main className={styles.Admin}>
      <div className={styles.inner}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>
            <p>ADMIN</p>
            <h2>관리자</h2>
          </div>

          <nav className={styles.adminMenu} aria-label="관리자 메뉴">
            {adminMenus.map((menu) => (
              <NavLink
                key={menu.label}
                to={menu.path}
                end={menu.end}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                {menu.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className={styles.contentArea}>
          <div className={styles.contentHeader}>
            <p>ADMIN PAGE</p>
            <h3>{title}</h3>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
};

export default AdminLayout;




