import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getProducts, updateProduct } from '../firebase/productApi';
import styles from './Admin.module.scss';

const AdminRecommended = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recommendedCount = products.filter((product) => product.isRecommended).length;
  const sortedProducts = useMemo(() => [...products].sort((first, second) => {
    if (first.isRecommended !== second.isRecommended) {
      return Number(second.isRecommended) - Number(first.isRecommended);
    }
    return String(first.name).localeCompare(String(second.name), 'ko');
  }), [products]);

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      setProducts(await getProducts({ fallbackToJson: false }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleRecommended = async (product) => {
    setTogglingId(product.id);
    setMessage('');
    setErrorMessage('');

    try {
      await updateProduct(product.id, {
        ...product,
        isRecommended: !product.isRecommended,
      });
      setMessage(
        product.isRecommended
          ? '추천 상품에서 해제되었습니다.'
          : '추천 상품으로 설정되었습니다.',
      );
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setTogglingId('');
    }
  };

  return (
    <AdminLayout title="추천상품관리">
      {message && <p className={styles.successMessage}>{message}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      <p className={styles.recommendedSummary}>추천 상품 {recommendedCount}/4</p>

      {isLoading ? (
        <p className={styles.stateMessage}>상품 목록을 불러오는 중입니다.</p>
      ) : products.length === 0 ? (
        <div className={styles.panelBox}>
          <strong>Firestore 상품이 없습니다</strong>
          <Link className={styles.panelLink} to="/admin/products">상품관리로 이동</Link>
        </div>
      ) : (
        <div className={styles.productAdminList}>
          {sortedProducts.map((product) => (
            <article key={product.id} className={styles.productAdminItem}>
              <img src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <p>{Number(product.price || 0).toLocaleString()}원 · 재고 {Number(product.stock || 0).toLocaleString()}개</p>
              </div>
              <div className={styles.recommendStatusArea}>
                <span className={product.isRecommended ? styles.recommendedBadge : styles.normalBadge}>
                  {product.isRecommended ? '추천중' : '일반상품'}
                </span>
              </div>
              <div className={styles.recommendActions}>
                <button
                  type="button"
                  className={product.isRecommended ? styles.recommendedButton : styles.recommendButton}
                  onClick={() => toggleRecommended(product)}
                  disabled={togglingId === product.id}
                >
                  {togglingId === product.id
                    ? '처리 중...'
                    : product.isRecommended ? '추천해제' : '추천지정'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRecommended;
