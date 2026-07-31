import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DELEIVERY_NIMIMUM } from '../constants/delivery';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import EmptyMessage from '../components/EmptyMessage';
import { createCartOrder } from '../firebase/orderApi';
import { clearUserCartItems, deleteUserCartItem, getUserCartItems, updateUserCartItemQuantity } from '../firebase/cartApi';
import { useAuthStore } from '../store/authStore';
import styles from './Cart.module.scss';

const Cart = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [cartItem, setCartItem] = useState([]);
  const [cartError, setCartError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (isAuthLoading) return;

      if (!isLoggedIn || !currentUser?.uid) {
        setCartItem([]);
        setIsCartLoading(false);
        return;
      }

      setIsCartLoading(true);
      setCartError('');

      try {
        const cartData = await getUserCartItems(currentUser.uid);
        setCartItem(cartData);
      } catch (error) {
        setCartError(error.message);
      } finally {
        setIsCartLoading(false);
      }
    };

    loadCart();
  }, [currentUser?.uid, isAuthLoading, isLoggedIn]);

  const clearCart = async () => {
    const answer = window.confirm('장바구니 상품을 모두 삭제하시겠습니까?');
    if (!answer) return;

    setCartError('');

    try {
      await clearUserCartItems(currentUser.uid);
      setCartItem([]);
    } catch (error) {
      setCartError(error.message);
    }
  };

  const changeQuantity = async (cartId, newQuantity) => {
    setCartError('');

    try {
      await updateUserCartItemQuantity({ cartId, quantity: newQuantity });
      setCartItem((prev) => prev.map((item) => (
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      )));
    } catch (error) {
      setCartError(error.message);
    }
  };

  const removeItem = async (cartId) => {
    setCartError('');

    try {
      await deleteUserCartItem(cartId);
      setCartItem((prev) => prev.filter((item) => item.id !== cartId));
    } catch (error) {
      setCartError(error.message);
    }
  };

  const getItemPrice = (item) => Number(item.discountPrice || item.price || item.productPrice || 0);

  const subtotal = cartItem.reduce((total, item) => {
    return total + getItemPrice(item) * Number(item.quantity || 1);
  }, 0);

  const deliveryfree = subtotal >= DELEIVERY_NIMIMUM ? 0 : 3000;
  const totalPrice = subtotal + deliveryfree;

  const orderCart = async () => {
    setOrderError('');

    if (isAuthLoading) {
      setOrderError('로그인 상태를 확인중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!isLoggedIn || !currentUser) {
      window.alert('로그인 후 주문할 수 있습니다.');
      navigate('/login');
      return;
    }

    setIsOrdering(true);

    try {
      await createCartOrder({
        user: currentUser,
        items: cartItem,
        subtotal,
        deliveryfree,
        totalPrice,
      });
      await clearUserCartItems(currentUser.uid);
      setCartItem([]);
      window.alert('주문이 완료되었습니다. 마이페이지 주문 내역에서 확인할 수 있습니다.');
      navigate('/mypage');
    } catch (error) {
      setOrderError(error.message);
    } finally {
      setIsOrdering(false);
    }
  };

  if (isAuthLoading || isCartLoading) {
    return <p>장바구니를 불러오는 중입니다.</p>;
  }

  if (!isLoggedIn) {
    return (
      <section className={styles.Cart}>
        <EmptyMessage
          image="/img/empty/empty-cart.svg"
          title="로그인이 필요합니다"
          des="장바구니는 로그인 후 이용할 수 있습니다"
          link="/login"
          linkText="로그인하기"
        />
      </section>
    );
  }

  return (
    <section className={styles.Cart}>
      <div className={styles.titleArea}>
        <p>CART</p>
        <h2>장바구니</h2>
        <span>담긴 상품 {cartItem.length}개</span>
      </div>

      {cartError && <p className={styles.orderError}>{cartError}</p>}

      {cartItem.length === 0 ? (
        <EmptyMessage
          image="/img/empty/empty-cart.svg"
          title="장바구니가 비었습니다"
          des="마음에 드는 상품을 장바구니에 담아보세요"
          link="/products"
          linkText="상품 보러가기"
        />
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.cartList}>
            <div className={styles.listHeader}>
              <strong>장바구니 상품</strong>
              <button type="button" onClick={clearCart}>전체 삭제</button>
            </div>

            {cartItem.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onChangeQuantity={changeQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className={styles.summaryArea}>
            <OrderSummary
              subtotal={subtotal}
              deliveryfree={deliveryfree}
              totalprice={totalPrice}
              onOrder={orderCart}
              isOrdering={isOrdering}
            />
            {orderError && <p className={styles.orderError}>{orderError}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
