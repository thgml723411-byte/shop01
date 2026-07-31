import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom'
import styles from './Products.module.scss';
import ProductFilter from '../components/ProductFilter';
import ProductSort from '../components/ProductSort';
import ProductList from '../components/ProductList';
import { subscribeProducts } from '../firebase/productApi';

const categoryNames = {
   'glass-basket': '글라스 바스켓',
   'long-wrap': '롱 랩 부케',
   'deco-flower': '데코 플라워',
   'message-card': '메시지 카드',
};

const Products = () => {
   const {category} = useParams()
   const [products,setProducts] = useState([])
   const [priceRange,setPriceRange] = useState('all') 
   const [sortType,setSortType] = useState('latest')

   useEffect(()=>{
      const unsubscribe = subscribeProducts({
         onNext: setProducts,
         onError: (error) => {
            console.error(error.message)
            setProducts([])
         },
      })

      return unsubscribe
   },[])

   const categoryItem = category
      ? products.filter((item) => item.categoryValue === category)
      : products;

   const selectItem = categoryItem.filter((item)=>{
      const disprice = item.price - ((item.price * item.discountRate) / 100)

      if(priceRange === 'under10'){
         return disprice < 100000
      }

      if(priceRange === '10to30'){
         return disprice >= 100000 && disprice < 300000
      }

      if(priceRange === 'over30'){
         return disprice >= 300000
      }

      return true
   })

   /*
   sort의규칙
      const num = [30,50,20,10,40]
      num.sort((a,b)=>a-b) // 오름차순 [10,20,30,40,50]
      num.sort((a,b)=>b-a) // 내림차순 [50,40,30,20,10]

      const product = [
        {id:1,name:'키보드',price:3000},
        {id:2,name:'마우스',price:1000},
        {id:3,name:'모니터',price:5000},
      ]
      product.sort((a,b) => a.price - b.price) // 마우스, 키보드, 모니터
      product.sort((a,b) => b.price - a.price) //
   */
   const sortItem = [...selectItem].sort((a,b)=>{
      const firstPrice = a.price - ((a.price*a.discountRate)/100)
      const secondPrice = b.price - ((b.price*b.discountRate)/100)

      if(sortType === 'lowPrice'){
         return firstPrice - secondPrice
      }

      if(sortType === 'highPrice'){
         return secondPrice - firstPrice
      }
      return String(b.id).localeCompare(String(a.id))
   })

   const categoryTitle = category ? categoryNames[category] || category : '전체상품';

  return (
    <section className={styles.Products}>
      <div className={styles.inner}>
        <div className={styles.titleArea}>
          <p>PRODUCTS</p>
          <h2>{categoryTitle}</h2>
          <span>{sortItem.length}개의 상품이 있습니다</span>
        </div>
        <div className={styles.optionArea}>
          <ProductFilter
            selectCategody={category || ''}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
          <ProductSort sortType={sortType} setSortType={setSortType}/>
        </div>
        <div className={styles.listArea}>
          <ProductList products={sortItem} />
        </div>
      </div>
    </section>
  );
};

export default Products;



