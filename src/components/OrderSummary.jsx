import styles from './OrderSummary.module.scss';

const OrderSummary = ({ subtotal, deliveryfree, totalprice, onOrder, isOrdering = false }) => {
  return (
    <aside className={styles.OrderSummary}>
      <h2>결제 금액</h2>

      <div>
        <span>상품금액</span>
        <strong>{subtotal.toLocaleString()}원</strong>
      </div>

      <div>
        <span>배송비</span>
        <strong>{deliveryfree === 0 ? '무료' : `${deliveryfree.toLocaleString()}원`}</strong>
      </div>

      <div>
        <span>총 결제금액</span>
        <strong>{totalprice.toLocaleString()}원</strong>
      </div>

      <button type="button" onClick={onOrder} disabled={subtotal === 0 || isOrdering}>
        {isOrdering ? '주문 처리중...' : '주문하기'}
      </button>
    </aside>
  );
};

export default OrderSummary;
