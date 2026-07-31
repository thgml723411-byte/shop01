import React from 'react';
import { Link } from 'react-router-dom';
import QuantityControl from './QuantityControl';
import styles from './CartItem.module.scss';

const CartItem = ({ item, onChangeQuantity, onRemove }) => {
  const productId = item.productId || item.id;
  const productName = item.productName || item.name || '상품명 없음';
  const itemPrice = Number(item.discountPrice || item.price || item.productPrice || 0);
  const quantity = Number(item.quantity || 1);
  const totalPrice = itemPrice * quantity;
  const maxQuantity = item.stock ?? 20;

  return (
    <article className={styles.CartItem}>
      <Link to={`/products/${productId}`}>
        <img src={item.image} alt={productName} />
      </Link>

      <div>
        <p>{item.category}</p>
        <Link to={`/products/${productId}`}>{productName}</Link>
        <strong>{itemPrice.toLocaleString()}원</strong>
      </div>

      <div>
        <span>수량</span>
        <QuantityControl quantity={quantity} setQuantity={(newQ) => onChangeQuantity(item.cartId || item.id, newQ)} maxQuantity={maxQuantity} />
      </div>

      <div>
        <span>상품금액</span>
        <strong>{totalPrice.toLocaleString()}원</strong>
      </div>

      <button type="button" onClick={() => onRemove(item.cartId || item.id)}>X</button>
    </article>
  );
};

export default CartItem;
