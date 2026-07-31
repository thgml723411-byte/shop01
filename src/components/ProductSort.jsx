import React from 'react';
import styles from './ProductSort.module.scss';

const ProductSort = ({sortType,setSortType}) => {
  return (
    <div className={styles.ProductSort}>
       <label>정렬</label>
       <select value={sortType} onChange={(e)=>setSortType(e.target.value)}>
          <option value='latest'>최신순</option>
          <option value='lowPrice'>낮은 가격순</option>
          <option value='highPrice'>높은 가격순</option>
       </select>
    </div>
  );
};

export default ProductSort;

//sortType,setSortType?쒖꽌?濡쒕뜲怨좊뱾?댁??쇳븿
