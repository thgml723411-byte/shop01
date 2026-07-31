import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  createProduct,
  deleteProduct,
  getProducts,
  migrateJsonProducts,
  updateProduct,
} from '../firebase/productApi';
import styles from './Admin.module.scss';

const LOW_STOCK_LIMIT = 5;

const initialForm = {
  name: '',
  nameEn: '',
  category: '',
  categoryValue: '',
  price: '',
  discountRate: '',
  stock: '',
  image: '',
  description: '',
  isRecommended: false,
};

const isValidStock = (stock) => /^\d+$/.test(String(stock));

const AdminProducts = () => {
  const formRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProducts = async ({ ensureMigration = false } = {}) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (ensureMigration) {
        await migrateJsonProducts();
      }
      setProducts(await getProducts({ fallbackToJson: false }));
    } catch (error) {
      setErrorMessage(error.message);
      setProducts(await getProducts());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts({ ensureMigration: true });
  }, []);

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setErrorMessage('');

    if (!isValidStock(form.stock)) {
      setErrorMessage('재고는 0 이상의 정수만 입력할 수 있습니다.');
      setIsSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, form);
        setMessage('상품이 수정되었습니다.');
      } else {
        await createProduct(form);
        setMessage('상품이 등록되었습니다.');
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      nameEn: product.nameEn || '',
      category: product.category || '',
      categoryValue: product.categoryValue || '',
      price: product.price || '',
      discountRate: product.discountRate || '',
      stock: product.stock || 0,
      image: product.image || '',
      description: product.description || '',
      isRecommended: Boolean(product.isRecommended),
    });
    setMessage('');
    setErrorMessage('');
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const changeStock = async (product, stockValue) => {
    if (!isValidStock(stockValue)) {
      setErrorMessage('재고는 0 이상의 정수만 입력할 수 있습니다.');
      return;
    }

    setMessage('');
    setErrorMessage('');

    try {
      await updateProduct(product.id, { ...product, stock: Number(stockValue) });
      setMessage('재고가 수정되었습니다.');
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const removeProduct = async (productId) => {
    const answer = window.confirm('이 상품을 삭제하시겠습니까?');
    if (!answer) return;

    setMessage('');
    setErrorMessage('');

    try {
      await deleteProduct(productId);
      if (editingId === productId) resetForm();
      setMessage('상품이 삭제되었습니다.');
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const getStockText = (stock) => {
    const stockNumber = Number(stock || 0);
    if (stockNumber === 0) return '품절';
    if (stockNumber <= LOW_STOCK_LIMIT) return '재고 부족';
    return '판매중';
  };

  const getStockClassName = (stock) => {
    const stockNumber = Number(stock || 0);
    if (stockNumber === 0) return styles.soldOutBadge;
    if (stockNumber <= LOW_STOCK_LIMIT) return styles.lowStockBadge;
    return styles.stockBadge;
  };

  return (
    <AdminLayout title="상품관리(재고관리)">

      {message && <p className={styles.successMessage}>{message}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      {isLoading ? (
        <p className={styles.stateMessage}>상품 목록을 불러오는 중입니다.</p>
      ) : products.length === 0 ? (
        <div className={styles.panelBox}>
          <strong>등록된 상품이 없습니다</strong>
          <p>상품을 먼저 등록해주세요.</p>
        </div>
      ) : (
        <div className={styles.productAdminList}>
          {products.map((product) => (
            <article key={product.id} className={styles.productAdminItem}>
              <img src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} / 재고 {Number(product.stock || 0).toLocaleString()}개</span>
                <p>{Number(product.price || 0).toLocaleString()}원 · 할인율 {Number(product.discountRate || 0)}%</p>
                <em className={getStockClassName(product.stock)}>{getStockText(product.stock)}</em>
              </div>
              <div className={styles.stockEditArea}>
                {product.isFirestoreProduct ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={Number(product.stock || 0)}
                    onChange={(event) => changeStock(product, event.target.value)}
                    aria-label={`${product.name} 재고 수량`}
                  />
                ) : null}
              </div>
              <div className={styles.itemActions}>
                {product.isFirestoreProduct ? (
                  <>
                    <button type="button" onClick={() => startEdit(product)}>수정</button>
                    <button type="button" onClick={() => removeProduct(product.id)}>삭제</button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <form ref={formRef} className={styles.productForm} onSubmit={submitProduct}>
        <div className={styles.formGrid}>
          <label><span>상품명</span><input name="name" value={form.name} onChange={changeForm} required /></label>
          <label><span>영문명</span><input name="nameEn" value={form.nameEn} onChange={changeForm} /></label>
          <label><span>카테고리 명</span><input name="category" value={form.category} onChange={changeForm} required /></label>
          <label><span>카테고리 값</span><input name="categoryValue" value={form.categoryValue} onChange={changeForm} required /></label>
          <label><span>가격</span><input type="number" name="price" value={form.price} onChange={changeForm} min="0" required /></label>
          <label><span>할인율</span><input type="number" name="discountRate" value={form.discountRate} onChange={changeForm} min="0" max="100" required /></label>
          <label><span>재고</span><input type="number" name="stock" value={form.stock} onChange={changeForm} min="0" step="1" required /></label>
          <label><span>이미지</span><input name="image" value={form.image} onChange={changeForm} placeholder="/img/products/example.jpg" required /></label>
          <label className={styles.fullField}><span>설명</span><textarea name="description" value={form.description} onChange={changeForm} rows="4" /></label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={isSaving}>{isSaving ? '저장 중...' : editingId ? '상품 수정' : '상품 등록'}</button>
          {editingId && <button type="button" onClick={resetForm}>수정 취소</button>}
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProducts;


