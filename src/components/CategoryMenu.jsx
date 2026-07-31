import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryMenu.module.scss';

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch('/data/categories.json');
      const categoryData = await res.json();
      setCategories(categoryData);
    };

    loadCategories();
  }, []);

  return (
    <section className={styles.CategoryMenu}>
      <div className={styles.titleArea}>
        <p>SHOP BY CATEGORY</p>
        <h2>꽃의 분위기로 고르기</h2>
      </div>

      <div className={styles.categoryList}>
        {categories.map((item) => (
          <Link key={item.id} to={item.path} className={styles.categoryItem}>
            <div className={styles.imageBox}>
              {item.image ? <img src={item.image} alt={item.name} /> : <span>ALL</span>}
            </div>
            <strong>{item.name}</strong>
            <small>{item.description}</small>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryMenu;
