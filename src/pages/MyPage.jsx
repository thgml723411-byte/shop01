import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MyPage.module.scss';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, updateUserNickname, updateUserPassword } from '../firebase/userApi';
import { getUserOrders } from '../firebase/orderApi';
import { getProducts } from '../firebase/productApi';
import { deleteUserCartItem, getUserCartItems } from '../firebase/cartApi';
import { deleteUserWishlistItem, getUserWishlistItems } from '../firebase/wishlistApi';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

const formatPrice = (price) => `${Number(price || 0).toLocaleString()}원`;

const getOrderItems = (order) => {
  if (Array.isArray(order.items) && order.items.length > 0) return order.items;
  if (Array.isArray(order.products) && order.products.length > 0) return order.products;
  return [order];
};

const getOrderName = (order) => {
  const names = getOrderItems(order).map((item) => item.productName || item.name || item.title).filter(Boolean);
  if (names.length === 0) return '상품명 없음';
  if (names.length === 1) return names[0];
  return `${names[0]} 외 ${names.length - 1}개`;
};

const getOrderQuantity = (order) => {
  return getOrderItems(order).reduce((total, item) => total + Number(item.quantity || 1), 0);
};

const getOrderAmount = (order) => {
  if (order.totalPrice || order.orderAmount || order.amount) return order.totalPrice || order.orderAmount || order.amount;
  return getOrderItems(order).reduce((total, item) => {
    const price = item.discountPrice || item.price || item.productPrice || 0;
    const quantity = item.quantity || 1;
    return total + Number(price) * Number(quantity);
  }, 0);
};

const getOrderImage = (order) => {
  const firstItem = getOrderItems(order)[0] || {};
  return firstItem.image || firstItem.productImage || order.image || order.productImage || '/img/empty/empty-cart.svg';
};
const getOrderProductId = (order, products) => {
  const firstItem = getOrderItems(order)[0] || {};
  const rawProductId = String(firstItem.productId || order.productId || '');
  const ownerUid = String(order.userId || order.uid || '');
  const productId = ownerUid && rawProductId.startsWith(`${ownerUid}_`)
    ? rawProductId.slice(ownerUid.length + 1)
    : rawProductId;
  const productName = firstItem.productName || firstItem.name || firstItem.title || '';
  const productImage = firstItem.image || firstItem.productImage || order.image || order.productImage || '';
  const matchedProduct = products.find((product) => (
    String(product.id) === productId
    || String(product.legacyId || '') === productId
    || (productName && product.name === productName)
    || (productImage && product.image === productImage)
  ));

  return matchedProduct?.id || productId;
};
const getCartName = (item) => item.productName || item.name || item.title || '상품명 없음';
const getCartPrice = (item) => Number(item.discountPrice || item.price || item.productPrice || 0);
const getCartQuantity = (item) => Number(item.quantity || 1);
const getCartItemTotal = (item) => getCartPrice(item) * getCartQuantity(item);
const getCartImage = (item) => item.image || item.productImage || '/img/empty/empty-cart.svg';
const getWishlistName = (item) => item.productName || item.name || item.title || '상품명 없음';
const getWishlistPrice = (item) => Number(item.discountPrice || item.price || item.productPrice || 0);
const getWishlistImage = (item) => item.image || item.productImage || '/img/empty/empty-cart.svg';

const MyPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [cartError, setCartError] = useState('');
  const [wishlistError, setWishlistError] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editError, setEditError] = useState('');
  const [isNicknameSaving, setIsNicknameSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [deletingCartId, setDeletingCartId] = useState('');
  const [deletingWishlistId, setDeletingWishlistId] = useState('');

  const cartTotalAmount = cartItems.reduce((total, item) => total + getCartItemTotal(item), 0);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) return;
      setIsProfileLoading(true);
      setProfileError('');
      try {
        const userData = await getUserProfile(currentUser);
        setProfile(userData);
        setNickname(userData.nickname || '');
        setUserProfile(userData);
      } catch (error) {
        setProfileError(error.message);
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [currentUser?.uid, setUserProfile]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser?.uid) return;
      setIsOrderLoading(true);
      setOrderError('');
      try {
        const [orderData, productData] = await Promise.all([
          getUserOrders(currentUser.uid),
          getProducts(),
        ]);
        setOrders(orderData);
        setOrderProducts(productData);
      } catch (error) {
        setOrderError(error.message);
      } finally {
        setIsOrderLoading(false);
      }
    };
    loadOrders();
  }, [currentUser?.uid]);

  useEffect(() => {
    const loadCartItems = async () => {
      if (!currentUser?.uid) return;
      setIsCartLoading(true);
      setCartError('');
      try {
        const cartData = await getUserCartItems(currentUser.uid);
        setCartItems(cartData);
      } catch (error) {
        setCartError(error.message);
      } finally {
        setIsCartLoading(false);
      }
    };
    loadCartItems();
  }, [currentUser?.uid]);

  useEffect(() => {
    const loadWishlistItems = async () => {
      if (!currentUser?.uid) return;
      setIsWishlistLoading(true);
      setWishlistError('');
      try {
        const wishlistData = await getUserWishlistItems(currentUser.uid);
        setWishlistItems(wishlistData);
      } catch (error) {
        setWishlistError(error.message);
      } finally {
        setIsWishlistLoading(false);
      }
    };
    loadWishlistItems();
  }, [currentUser?.uid]);

  const submitNickname = async (e) => {
    e.preventDefault();
    setEditMessage('');
    setEditError('');
    setIsNicknameSaving(true);
    try {
      const savedNickname = await updateUserNickname({ uid: currentUser.uid, nickname });
      const nextProfile = { ...profile, nickname: savedNickname };
      setProfile(nextProfile);
      setUserProfile(nextProfile);
      setEditMessage('닉네임이 수정되었습니다.');
    } catch (error) {
      setEditError(error.message);
    } finally {
      setIsNicknameSaving(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setEditMessage('');
    setEditError('');
    setIsPasswordSaving(true);
    try {
      await updateUserPassword({ user: currentUser, password });
      setPassword('');
      setEditMessage('비밀번호가 수정되었습니다.');
    } catch (error) {
      setEditError(error.message);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const removeCartItem = async (cartId) => {
    const answer = window.confirm('이 상품을 장바구니에서 삭제하시겠습니까?');
    if (!answer) return;
    setDeletingCartId(cartId);
    setCartError('');
    try {
      await deleteUserCartItem(cartId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartId));
    } catch (error) {
      setCartError(error.message);
    } finally {
      setDeletingCartId('');
    }
  };

  const removeWishlistItem = async (wishlistId) => {
    const answer = window.confirm('이 상품을 찜 목록에서 삭제하시겠습니까?');
    if (!answer) return;
    setDeletingWishlistId(wishlistId);
    setWishlistError('');
    try {
      await deleteUserWishlistItem(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch (error) {
      setWishlistError(error.message);
    } finally {
      setDeletingWishlistId('');
    }
  };

  return (
    <main className={styles.MyPage}>
      <div className={styles.inner}>
        <div className={styles.titleArea}>
          <p>MY PAGE</p>
          <h2>마이페이지</h2>
          <span>회원 정보와 쇼핑 활동을 확인하세요</span>
        </div>

        <div className={styles.dashboardGrid}>
          <section className={styles.infoPanel}>
            <div className={styles.panelTitle}><p>PROFILE</p><h3>회원 정보</h3></div>
            {isProfileLoading ? <p className={styles.stateMessage}>회원 정보를 불러오는 중입니다.</p> : profileError ? <p className={styles.errorMessage}>{profileError}</p> : (
              <dl className={styles.profileList}>
                <div><dt>닉네임</dt><dd>{profile?.nickname || '회원'}</dd></div>
                <div><dt>이메일</dt><dd>{profile?.email || currentUser?.email || '-'}</dd></div>
                <div><dt>가입일</dt><dd>{formatDate(profile?.createAt)}</dd></div>
              </dl>
            )}
          </section>

          <section className={styles.infoPanel}>
            <div className={styles.panelTitle}><p>EDIT</p><h3>회원 정보 수정</h3></div>
            <div className={styles.editArea}>
              <form className={styles.editForm} onSubmit={submitNickname}>
                <label><span>닉네임</span><input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" required /></label>
                <button type="submit" disabled={isNicknameSaving || isProfileLoading}>{isNicknameSaving ? '수정 중...' : '닉네임 수정'}</button>
              </form>
              <form className={styles.editForm} onSubmit={submitPassword}>
                <label><span>새 비밀번호</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상 입력" minLength="6" autoComplete="new-password" required /></label>
                <button type="submit" disabled={isPasswordSaving}>{isPasswordSaving ? '수정 중...' : '비밀번호 수정'}</button>
              </form>
              {editMessage && <p className={styles.successMessage}>{editMessage}</p>}
              {editError && <p className={styles.errorMessage}>{editError}</p>}
            </div>
          </section>

          <section className={styles.infoPanel}>
            <div className={styles.panelTitle}><p>ORDERS</p><h3>주문 내역</h3></div>
            {isOrderLoading ? <p className={styles.stateMessage}>주문 내역을 불러오는 중입니다.</p> : orderError ? <p className={styles.errorMessage}>{orderError}</p> : orders.length === 0 ? (
              <div className={styles.placeholderBox}><strong>아직 주문 내역이 없습니다</strong><p>마음에 드는 상품을 둘러보고 첫 주문을 시작해보세요.</p><Link to="/products" className={styles.panelLink}>상품 목록으로 이동</Link></div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => {
                  const productId = getOrderProductId(order, orderProducts);
                  const orderImage = <img src={getOrderImage(order)} alt={getOrderName(order)} />;

                  return (
                    <article key={order.id} className={styles.orderItem}>
                      {productId ? (
                        <Link
                          className={styles.orderImageLink}
                          to={`/products/${productId}`}
                          aria-label={`${getOrderName(order)} 상세페이지로 이동`}
                        >
                          {orderImage}
                        </Link>
                      ) : orderImage}
                      <div>
                        <strong>{getOrderName(order)}</strong>
                        <dl>
                          <div><dt>주문일</dt><dd>{formatDate(order.createAt || order.createdAt || order.orderDate)}</dd></div>
                          <div><dt>수량</dt><dd>{getOrderQuantity(order)}개</dd></div>
                          <div><dt>주문금액</dt><dd>{formatPrice(getOrderAmount(order))}</dd></div>
                        </dl>
                      </div>
                    </article>
                  );
                })}
                <Link to="/products" className={styles.panelLink}>상품 목록으로 이동</Link>
              </div>
            )}
          </section>

          <section className={styles.infoPanel}>
            <div className={styles.panelTitle}><p>CART</p><h3>장바구니</h3></div>
            {isCartLoading ? <p className={styles.stateMessage}>장바구니를 불러오는 중입니다.</p> : cartError ? <p className={styles.errorMessage}>{cartError}</p> : cartItems.length === 0 ? (
              <div className={styles.placeholderBox}><strong>장바구니가 비어 있습니다</strong><p>담아둔 상품이 없습니다. 상품을 장바구니에 담아보세요.</p><Link to="/cart" className={styles.panelLink}>장바구니 페이지로 이동</Link></div>
            ) : (
              <div className={styles.cartMiniList}>{cartItems.map((item) => (
                <article key={item.id} className={styles.cartMiniItem}><img src={getCartImage(item)} alt={getCartName(item)} /><div><strong>{getCartName(item)}</strong><dl><div><dt>가격</dt><dd>{formatPrice(getCartPrice(item))}</dd></div><div><dt>수량</dt><dd>{getCartQuantity(item)}개</dd></div><div><dt>상품별 금액</dt><dd>{formatPrice(getCartItemTotal(item))}</dd></div></dl></div><button type="button" onClick={() => removeCartItem(item.id)} disabled={deletingCartId === item.id}>{deletingCartId === item.id ? '삭제 중...' : '삭제'}</button></article>
              ))}<div className={styles.cartTotalBox}><span>전체 합계 금액</span><strong>{formatPrice(cartTotalAmount)}</strong></div><Link to="/cart" className={styles.panelLink}>장바구니 페이지로 이동</Link></div>
            )}
          </section>

          <section className={styles.infoPanel}>
            <div className={styles.panelTitle}><p>WISHLIST</p><h3>찜한 상품</h3></div>
            {isWishlistLoading ? <p className={styles.stateMessage}>찜 목록을 불러오는 중입니다.</p> : wishlistError ? <p className={styles.errorMessage}>{wishlistError}</p> : wishlistItems.length === 0 ? (
              <div className={styles.placeholderBox}><strong>찜한 상품이 없습니다</strong><p>마음에 드는 상품을 찜해보세요.</p><Link to="/products" className={styles.panelLink}>상품 목록으로 이동</Link></div>
            ) : (
              <div className={styles.wishlistMiniList}>{wishlistItems.map((item) => (
                <article key={item.id} className={styles.wishlistMiniItem}>
                  <img src={getWishlistImage(item)} alt={getWishlistName(item)} />
                  <div><strong>{getWishlistName(item)}</strong><span>{formatPrice(getWishlistPrice(item))}</span></div>
                  <button type="button" onClick={() => removeWishlistItem(item.id)} disabled={deletingWishlistId === item.id}>{deletingWishlistId === item.id ? '삭제 중...' : '삭제'}</button>
                </article>
              ))}<Link to="/products" className={styles.panelLink}>상품 목록으로 이동</Link></div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default MyPage;




