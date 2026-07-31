import React, {useState,useEffect}  from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductFilter.module.scss';

const ProductFilter = ({selectCategody = '', priceRange = 'all', setPriceRange}) => {
  const [categories,setCategories] = useState([])

  useEffect(()=>{
     const loadCa = async () => {
       const res = await fetch('/data/categories.json')
       const caData = await res.json()
       setCategories(caData)
     }
     loadCa()
  },[])

  const getClass = (path) => {
    if(path === '/products' && selectCategody === '') return styles.active;
    if(path === `/products/category/${selectCategody}`) return styles.active;
    return '';
  }

  const handlePriceChange = (e) => {
    if(setPriceRange){
      setPriceRange(e.target.value)
    }
  }

  return (
    <div className={styles.ProductFilter}>
      <div className={styles.filterGroup}>
        <strong>카테고리</strong>
        <div className={styles.categoryLinks}>
          <Link to="/products" className={getClass('/products')}>전체</Link>
          {categories.filter((item) => item.name !== '전체').map((item)=>(
            <Link key={item.id} to={item.path} className={getClass(item.path)}>
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <label className={styles.filterGroup}>
        <strong>가격대</strong>
        <select value={priceRange} onChange={handlePriceChange}>
          <option value="all">전체 가격</option>
          <option value="under10">10만원 미만</option>
          <option value="10to30">10만원 이상 30만원 미만</option>
          <option value="over30">30만원 이상</option>
        </select>
      </label>
    </div>
  );
};

export default ProductFilter;

