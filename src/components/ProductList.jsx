import React from 'react';
import ProductCard from './ProductCard';
import styles from './ProductList.module.scss';

const ProductList = ({ products = [], onWishChange }) => {
  if (products.length === 0) {
    return <p className={styles.empty}>등록된 상품이 없습니다.</p>;
  }

  return (
    <div className={styles.ProductList}>
      {products.map((item) => (
        <ProductCard key={item.id} product={item} onWishChange={onWishChange} />
      ))}
    </div>
  );
};

export default ProductList;

//주인이보내준걸받아가지고그안에서다시만드는데한개자료만넘겨주고카드만들어
//({ products = [] })오류예방방지넘겨받은게없으면빈배열로처리해/초기값