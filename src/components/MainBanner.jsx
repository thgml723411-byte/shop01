import React, { useEffect, useState } from 'react';
import styles from './MainBanner.module.scss';

const MainBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      const res = await fetch('/data/banners.json');
      const bannerData = await res.json();
      setBanners(bannerData);
    };

    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentIndex((idx) => {
        if (idx === banners.length - 1) {
          return 0;
        }
        return idx + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const onPrev = () => {
    setCurrentIndex((idx) => {
      if (idx === 0) {
        return banners.length - 1;
      }
      return idx - 1;
    });
  };

  const onNext = () => {
    setCurrentIndex((idx) => {
      if (idx === banners.length - 1) {
        return 0;
      }
      return idx + 1;
    });
  };

  if (banners.length === 0) {
    return <section className={styles.MainBanner}>배너를 불러오는 중입니다.</section>;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className={styles.MainBanner}>
      <img key={currentBanner.id} src={currentBanner.image} alt={currentBanner.title} />
      <div className={styles.overlay}>
        <div key={`text-${currentBanner.id}`} className={styles.TextBox}>
          <p>{currentBanner.eyebrow}</p>
          <h2>{currentBanner.title}</h2>
          <p>{currentBanner.description}</p>
        </div>

        <button className={styles.prevButton} type="button" onClick={onPrev}>
          &lt;
        </button>
        <button className={styles.nextButton} type="button" onClick={onNext}>
          &gt;
        </button>

        <div className={styles.dots}>
          {banners.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={idx === currentIndex ? styles.active : ''}
              aria-label={`${idx + 1}번째 배너 보기`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainBanner;




