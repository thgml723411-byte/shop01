import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import EmptyMessage from '../components/EmptyMessage';
import { deleteUserWishlistItem, getUserWishlistItems } from '../firebase/wishlistApi';
import { useAuthStore } from '../store/authStore';
import styles from './Wishlist.module.scss';

const Wishlist = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistError, setWishlistError] = useState('');
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthLoading) return;

      if (!isLoggedIn || !currentUser?.uid) {
        setWishlist([]);
        setIsWishlistLoading(false);
        return;
      }

      setIsWishlistLoading(true);
      setWishlistError('');

      try {
        const savedWishlist = await getUserWishlistItems(currentUser.uid);
        setWishlist(savedWishlist);
      } catch (error) {
        setWishlistError(error.message);
      } finally {
        setIsWishlistLoading(false);
      }
    };

    loadWishlist();
  }, [currentUser?.uid, isAuthLoading, isLoggedIn]);

  const clearWishlist = async () => {
    const answer = window.confirm('찜한 상품을 모두 삭제하시겠습니까?');
    if (!answer) return;

    setWishlistError('');

    try {
      for (const item of wishlist) {
        await deleteUserWishlistItem(item.id);
      }
      setWishlist([]);
    } catch (error) {
      setWishlistError(error.message);
    }
  };

  if (isAuthLoading || isWishlistLoading) {
    return <p>찜 목록을 불러오는 중입니다.</p>;
  }

  if (!isLoggedIn) {
    return (
      <section className={styles.Wishlist}>
        <div className={styles.inner}>
          <EmptyMessage
            image="/img/empty/empty-cart.svg"
            title="로그인이 필요합니다"
            des="찜한 상품은 로그인 후 이용할 수 있습니다"
            link="/login"
            linkText="로그인하기"
          />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.Wishlist}>
      <div className={styles.inner}>
        <div className={styles.titleArea}>
          <p>WISHLIST</p>
          <h2>찜한 상품</h2>
          <span>담긴 상품 {wishlist.length}개</span>
        </div>

        {wishlistError && <p>{wishlistError}</p>}

        {wishlist.length === 0 ? (
          <EmptyMessage
            image="/img/empty/empty-cart.svg"
            title="찜한 상품이 없습니다"
            des="마음에 드는 상품을 찜해보세요"
            link="/products"
            linkText="상품 보러가기"
          />
        ) : (
          <>
            <div className={styles.listHeader}>
              <strong>찜 목록</strong>
              <button type="button" onClick={clearWishlist}>전체 삭제</button>
            </div>
            <ProductList products={wishlist} onWishChange={setWishlist} />
          </>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
