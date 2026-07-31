import React from 'react';
import styles from './QuantityControl.module.scss';

// 수량 증감 버튼(-, +)과 현재 수량을 보여주는 컴포넌트입니다.
// CartItem에서 호출되며, 실제 수량 상태는 부모(Cart.jsx)가 관리하고
// 이 컴포넌트는 setQuantity 콜백으로 변경 요청만 전달합니다.
// props: quantity(현재 수량), setQuantity(수량 변경 콜백), maxQuantity(최대 구매 가능 수량)
const QuantityControl = ({quantity, setQuantity, maxQuantity}) => {

 // 최소 수량(1) 아래로 내려가지 않도록 막고 1씩 감소
 const decreaseQuantity = () =>{
  if(quantity > 1){
     setQuantity(quantity - 1)
  }
 }

 // 최대 수량(재고)을 넘지 않도록 막고 1씩 증가
 const increaseQuantity= () =>{
  if(quantity < maxQuantity){
     setQuantity(quantity + 1)
  }
 }

  return (
    <div className={styles.quantityControl}>
       {/* 수량이 1일 때는 더 뺄 수 없으므로 버튼 비활성화 */}
       <button type="button" onClick={decreaseQuantity} disabled={quantity === 1}>-</button>
       <span>{quantity}</span>
       {/* 최대 수량에 도달하면 더 늘릴 수 없으므로 버튼 비활성화 */}
       <button type="button" onClick={increaseQuantity} disabled={quantity === maxQuantity}>+</button>
    </div>
  );
};

export default QuantityControl;