import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUserCartItem } from '../firebase/cartApi';
import { addUserWishlistItem, getUserWishlistItems, removeUserWishlistProduct } from '../firebase/wishlistApi';
import { useAuthStore } from '../store/authStore';
import styles from './ProductCard.module.scss';

const ProductCard = ({ product, onWishChange }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();

  const productId = product.productId || product.id;
  const productName = product.productName || product.name || '상품명 없음';
  const productPrice = Number(product.price || product.productPrice || product.discountPrice || 0);
  const discountRate = Number(product.discountRate || 0);
  const stock = Number(product.stock || 0);
  const isSoldOut = stock === 0;
  const disprice = product.discountPrice
    ? Number(product.discountPrice)
    : productPrice - (productPrice * discountRate) / 100;
  const normalizedProduct = {
    ...product,
    id: productId,
    name: productName,
    price: productPrice,
    discountRate,
    image: product.image || product.productImage || '',
    stock,
  };

  useEffect(() => {
    const checkWishlist = async () => {
      if (!isLoggedIn || !currentUser?.uid) {
        setIsLiked(false);
        return;
      }

      try {
        const wishlist = await getUserWishlistItems(currentUser.uid);
        setIsLiked(wishlist.some((item) => String(item.productId) === String(productId)));
      } catch (error) {
        console.error(error.message);
      }
    };

    checkWishlist();
  }, [currentUser?.uid, isLoggedIn, productId]);

  const changeWishlist = async () => {
    if (!isLoggedIn || !currentUser?.uid) {
      window.alert('로그인 후 찜할 수 있습니다.');
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        await removeUserWishlistProduct({ uid: currentUser.uid, productId });
        setIsLiked(false);
        onWishChange?.((prev) => Array.isArray(prev) ? prev.filter((item) => String(item.productId || item.id) !== String(productId)) : prev);
      } else {
        await addUserWishlistItem({ user: currentUser, product: normalizedProduct });
        setIsLiked(true);
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  const addToCart = async () => {
    if (isSoldOut) {
      window.alert('품절 상품은 장바구니에 담을 수 없습니다.');
      return;
    }

    if (!isLoggedIn || !currentUser?.uid) {
      window.alert('로그인 후 장바구니에 담을 수 있습니다.');
      navigate('/login');
      return;
    }

    try {
      await addUserCartItem({ user: currentUser, product: normalizedProduct, quantity: 1 });
      setShowCartPopup(true);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <article className={styles.ProductCard}>
      <div className={styles.imageWrap}>
        <Link to={`/products/${productId}`}>
          <img className={styles.image} src={normalizedProduct.image} alt={productName} />
        </Link>
        {isSoldOut && <span className={styles.soldOutLabel}>품절</span>}
        <button type="button" onClick={changeWishlist}>{isLiked ? '♥' : '♡'}</button>
      </div>

      <div className={styles.info}>
        <p>{product.category}</p>
        <Link to={`/products/${productId}`}>{productName}</Link>
        {product.nameEn && <em className={styles.nameEn}>{product.nameEn}</em>}
        <div className={styles.priceWrap}>
          {discountRate > 0 && <span>{discountRate}%</span>}
          <strong>{disprice.toLocaleString()}원</strong>
        </div>

        <div className={styles.stockText}>{isSoldOut ? '품절' : `재고 ${stock.toLocaleString()}개`}</div>

        <div className={styles.actionWrap}>
          <Link to={`/products/${productId}`}>상세 보기</Link>
          <button type="button" onClick={addToCart} disabled={isSoldOut}>{isSoldOut ? '품절' : '장바구니 담기'}</button>
        </div>
      </div>

      {showCartPopup && (
        <div className={styles.cartPopup}>
          <div className={styles.popupBox}>
            <strong>장바구니에 담았습니다.</strong>
            <p>{productName}</p>
            <div>
              <button type="button" onClick={() => setShowCartPopup(false)}>계속 쇼핑</button>
              <button type="button" onClick={() => navigate('/cart')}>장바구니로 이동</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default ProductCard;
