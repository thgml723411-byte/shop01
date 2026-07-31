import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { getProducts } from '../firebase/productApi';
import styles from './SearchResult.module.scss';

const SearchResult = () => {
  const { keyword } = useParams();
  const [searchRul, setSearchRul] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchP = async () => {
      if (!keyword) {
        setSearchRul([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const proData = await getProducts();
        const trimkeyword = keyword.toLowerCase().trim();
        const results = proData.filter((item) => {
          const productName = item.name ? item.name.toLowerCase() : '';
          const productCategory = item.category ? item.category.toLowerCase() : '';
          return productName.includes(trimkeyword) || productCategory.includes(trimkeyword);
        });

        setSearchRul(results);
      } catch (error) {
        console.error('상품 검색 중 오류가 발생했습니다:', error);
        setSearchRul([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchP();
  }, [keyword]);

  return (
    <section className={styles.SearchResult}>
      <div className={styles.inner}>
        <div className={styles.titleArea}>
          <p>SEARCH</p>
          <h2>{keyword} 검색결과</h2>
          <span>총 {searchRul.length}개의 상품을 찾았습니다</span>
        </div>

        {isLoading ? <p>상품을 검색하는 중입니다.</p> : <ProductList products={searchRul} />}
      </div>
    </section>
  );
};

export default SearchResult;
