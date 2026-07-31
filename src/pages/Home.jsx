import React, { useEffect, useState } from 'react';
import MainBanner from '../components/MainBanner';
import CategoryMenu from '../components/CategoryMenu';
import ProductList from '../components/ProductList';
import { subscribeProducts } from '../firebase/productApi';
import styles from './Home.module.scss';

const Home = () => {
  const [homeProducts, setHomeProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeProducts({
      onNext: (productsData) => {
        const recommendProducts = productsData
          .filter((item) => item.isRecommended)
          .slice(0, 4);
        setHomeProducts(recommendProducts);
      },
      onError: (error) => {
        console.error(error.message);
        setHomeProducts([]);
      },
    });

    return unsubscribe;
  }, []);

  return (
    <main className={styles.Home}>
      <MainBanner />
      <CategoryMenu />
      <section className={styles.recommendSection}>
        <h2>추천상품</h2>
        <ProductList products={homeProducts} />
      </section>
    </main>
  );
};

export default Home;

