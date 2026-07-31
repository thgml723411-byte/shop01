import React,{useEffect,useState} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QuantityControl from '../components/QuantityControl';
import { addUserCartItem } from '../firebase/cartApi';
import { addUserWishlistItem, getUserWishlistItems, removeUserWishlistProduct } from '../firebase/wishlistApi';
import { useAuthStore } from '../store/authStore';
import { subscribeProductById } from '../firebase/productApi';
import styles from './ProductDetail.module.scss';
const flowerCompositionMap = {
  1: [
    {name: '카라 (Calla Lily)', note: '깔때기 모양의 흰색 꽃', pos: {x: 82, y: 70}, corner: 'bottomRight'},
    {name: '튤립 (Tulip)', note: '연보라/연분홍빛의 튤립(겹튤립)', pos: {x: 51, y: 50}, corner: 'topRight'},
    {name: '알리움 (Allium)', note: '보라색 둥근 꽃', pos: {x: 54, y: 64}, corner: 'topLeft'},
    {name: '호접란 (Phalaenopsis)', note: '흰색 서양란', pos: {x: 39, y: 73}, corner: 'bottomLeft'},
  ],
  2: [
    {name: '튤립 (Tulip)', note: '오렌지 컬러의 꽃잎', pos: {x: 73, y: 67}, corner: 'bottomRight'},
    {name: '알리움 (Allium)', note: '굽어 올라간 긴 곡선 줄기', pos: {x: 57, y: 24}, corner: 'topRight'},
    {name: '에우코미스 (Eucomis)', note: '넓은 포엽 꽃', pos: {x: 59, y: 45}, corner: 'topLeft'},
    {name: '수선화 (Narcissus)', note: '연한 베이지·살구빛 꽃', pos: {x: 62, y: 63}, corner: 'bottomLeft'},
  ],
  3: [
    {name: '프리티라리아 (Fritillaria)', note: '노란빛 종 모양 꽃', pos: {x: 52, y: 18}, corner: 'bottomLeft'},
    {name: '델피늄 / 라넌큘러스 락스퍼 (Delphinium / Larkspur)', note: '가지 끝 촘촘한 핑크빛 꽃송이', pos: {x: 19, y: 13}, corner: 'topLeft'},
    {name: '스위트피 (Sweet Pea)', note: '나풀거리는 연분홍 꽃잎', pos: {x: 74, y: 17}, corner: 'topRight'},
    {name: '튤립 (Tulip)', note: '탐스러운 핑크빛 튤립', pos: {x: 56, y: 34}, corner: 'bottomRight'},
  ],
  4: [
    {name: '호접란 (Phalaenopsis Orchid)', note: '풍성한 흰색 서양란 송이', pos: {x: 80, y: 70}, corner: 'bottomRight'},
    {name: '네리네 (Nerine)', note: '분홍빛 별모양 꽃송이', pos: {x: 71, y: 25}, corner: 'topRight'},
    {name: '튤립 (Tulip)', note: '은은한 핑크빛 튤립 봉오리', pos: {x: 61, y: 40}, corner: 'bottomLeft'},
    {name: '미니 델피늄 (Mini Delphinium)', note: '가지 끝 자잘한 흰 꽃송이', pos: {x: 30, y: 38}, corner: 'topLeft'},
  ],
  5: [
    {name: '겹백합 / 로즈릴리 (Rose Lily / Double Lily)', note: ''},
    {name: '핑크 하트 큐빅', note: '핑크 하트 장식이 사랑스러운 포인트를 만들어줍니다.'},
    {name: '달 큐빅', note: '달 모양 큐빅 장식이 은은한 반짝임을 더합니다.'},
  ],
  6: [
    {name: '백합 (Lily)', note: ''},
    {name: '핑크 하트 큐빅', note: '핑크 하트 장식이 사랑스러운 포인트를 만들어줍니다.'},
    {name: '달 큐빅', note: '달 모양 큐빅 장식이 은은한 반짝임을 더합니다.'},
  ],
  7: [
    {name: '마트리카리아 (Matricaria)', note: ''},
    {name: '메시지 작성면', note: '뒷면에는 선물 문구를 적을 수 있는 여백이 있습니다.'},
  ],
  8: [
    {name: '거베라 (Gerbera)', note: ''},
    {name: '메시지 작성면', note: '뒷면에는 선물 문구를 적을 수 있는 여백이 있습니다.'},
  ],
}

// 메시지 카드 상품(꽃 구성에 pos/corner가 없는 앞면+뒷면 2항목 구성)의 사이즈·재질 스펙입니다.
const messageCardSpecMap = {
  7: { size: '10 x 15 cm', material: '고급 무광 아트지 250g', envelope: '미포함 (카드만 배송)' },
  8: { size: '10 x 15 cm', material: '고급 무광 아트지 250g', envelope: '미포함 (카드만 배송)' },
}

// 상품별 포장 과정 이미지입니다. 해당 상품에만 노출됩니다.
const packagingImagesMap = {
  1: [
    {src: '/img/flowers/aiimg05.png', caption: '통기성 셀로판 포장으로 신선하게'},
    {src: '/img/flowers/aiimg04.png', caption: '전용 유리화병과 완충재로 안전 포장'},
  ],
  2: [
    {src: '/img/flowers/ai01.png', caption: '통기성 셀로판 포장으로 신선하게'},
    {src: '/img/flowers/ai02.png', caption: '전용 유리화병과 완충재로 안전 포장'},
    {src: '/img/flowers/ai03.png', caption: '유리 파손을 막는 이중 보호 포장'},
  ],
  3: [
    {src: '/img/flowers/aiimg06.png', caption: '완충재를 채운 전용 박스로 안전하게 포장'},
  ],
  4: [
    {src: '/img/flowers/aiimg08.png', caption: '완충재를 채운 전용 박스로 안전하게 포장'},
  ],
  5: [
    {src: '/img/flowers/aiimg09.png', caption: '완충재를 채운 전용 박스로 안전하게 포장'},
  ],
  6: [
    {src: '/img/flowers/aiimg10.png', caption: '완충재를 채운 전용 박스로 안전하게 포장'},
  ],
}

// 꽃 구성 다이어그램(사진 중앙 + 모서리 확대 콜아웃)의 기준 캔버스 크기와 각 모서리 위치입니다.
const DIAGRAM_W = 820
const DIAGRAM_H = 620
const PHOTO_W = 360
const PHOTO_H = 421
const PHOTO_LEFT = (DIAGRAM_W - PHOTO_W) / 2
const PHOTO_TOP = (DIAGRAM_H - PHOTO_H) / 2
const CALLOUT_SIZE = 150
const CORNER_BOX = {
  topLeft: {x: 0, y: 0},
  topRight: {x: DIAGRAM_W - CALLOUT_SIZE, y: 0},
  bottomLeft: {x: 0, y: DIAGRAM_H - CALLOUT_SIZE},
  bottomRight: {x: DIAGRAM_W - CALLOUT_SIZE, y: DIAGRAM_H - CALLOUT_SIZE},
}
const CORNER_ANCHOR = {
  topLeft: {x: CALLOUT_SIZE, y: CALLOUT_SIZE / 2},
  topRight: {x: DIAGRAM_W - CALLOUT_SIZE, y: CALLOUT_SIZE / 2},
  bottomLeft: {x: CALLOUT_SIZE, y: DIAGRAM_H - CALLOUT_SIZE / 2},
  bottomRight: {x: DIAGRAM_W - CALLOUT_SIZE, y: DIAGRAM_H - CALLOUT_SIZE / 2},
}
const ProductDetail = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [product,setProduct] = useState(null) // 상품 데이터를 담는 상태입니다. 처음에는 아직 불러오기 전이라 null로 둡니다.
  const [isLoading,setIsloading] = useState(true) // 상품 데이터를 불러오는 동안 로딩 문구를 보여주기 위한 상태입니다.
  const [quantity,setQuantity] = useState(1) // 사용자가 선택한 상품 수량입니다. QuantityControl에서 이 값을 바꿉니다.
  const [isLiked, setIsLiked] = useState(false) //

  useEffect(()=>{
      setIsloading(true)
      const unsubscribe = subscribeProductById({
        productId: id,
        onNext: (selectProduct) => {
          setProduct(selectProduct || null)
          setIsloading(false)
        },
        onError: (error) => {
          console.error(error.message)
          setProduct(null)
          setIsloading(false)
        },
      })

      return unsubscribe
  },[id])

  useEffect(()=>{
    const checkWishlist = async () => {
      if(!product) return

      if(!isLoggedIn || !currentUser?.uid){
        setIsLiked(false)
        return
      }

      try{
        const wishlist = await getUserWishlistItems(currentUser.uid)
        setIsLiked(wishlist.some((item)=>String(item.productId) === String(product.id)))
      }catch(error){
        console.error(error.message)
      }
    }

    checkWishlist()
  },[currentUser?.uid, isLoggedIn, product])
  if(isLoading){
    return <p>상품을 불러오는 중입니다 ......... </p>
  }

  if(!product){
    return (
      <>
       <p>상품을 찾을 수 없습니다</p>
        <Link to='/products'>상품 목록으로 이동</Link>
      </>
    )
  }

  // 현재 상세 페이지의 상품 가격과 할인율로 할인 적용 금액을 계산합니다.
  const maxQuantity = Number(product.stock ?? 20)
  const isSoldOut = maxQuantity === 0
  const discountprice = product.price - ((product.price * product.discountRate) / 100)

  const totalprice = quantity * discountprice


  const packagingImages = packagingImagesMap[product.legacyId || product.id] || []
  const flowerItems = flowerCompositionMap[product.legacyId || product.id] || []
  const hasFlowerDiagram = flowerItems.length > 0 && flowerItems.every((item) => item.pos && CORNER_BOX[item.corner])
  const isMessageCard = product.categoryValue === 'message-card'
  const cardSpec = messageCardSpecMap[product.legacyId || product.id]
  const [cardFrontItem, cardBackItem] = flowerItems
  const flowerDiagramItems = hasFlowerDiagram
    ? flowerItems.map((item) => {
        const box = CORNER_BOX[item.corner]
        const anchor = CORNER_ANCHOR[item.corner]
        return {
          ...item,
          pinX: PHOTO_LEFT + (item.pos.x / 100) * PHOTO_W,
          pinY: PHOTO_TOP + (item.pos.y / 100) * PHOTO_H,
          boxX: box.x,
          boxY: box.y,
          anchorX: anchor.x,
          anchorY: anchor.y,
        }
      })
    : []



  const toggleWishlist = async () => {
    if(!isLoggedIn || !currentUser?.uid){
      window.alert('로그인 후 찜할 수 있습니다.')
      navigate('/login')
      return
    }

    try{
      if(isLiked){
        await removeUserWishlistProduct({ uid: currentUser.uid, productId: product.id })
        setIsLiked(false)
      }else{
        await addUserWishlistItem({ user: currentUser, product })
        setIsLiked(true)
      }
    }catch(error){
      window.alert(error.message)
    }
  }
  const addTocart = async () => {
    if(isSoldOut){
      window.alert('품절 상품은 장바구니에 담을 수 없습니다.')
      return
    }

    if(!isLoggedIn || !currentUser?.uid){
      window.alert('로그인 후 장바구니에 담을 수 있습니다.')
      navigate('/login')
      return
    }

    try{
      await addUserCartItem({ user: currentUser, product, quantity })
      window.alert('장바구니에 담았습니다.')
    }catch(error){
      window.alert(error.message)
    }
  }
  return (
    <section className={styles.ProductDetail}>
      <Link to='/products' className={styles.backLink}>상품목록</Link>

      <div className={styles.productArea}>
        <div className={styles.imageArea}>
           <img src={product.image} alt={product.name} />
        </div>

        <div className={styles.infoArea}>
          <p>{product.category}</p>
          <h2>{product.name}</h2>
          <p>{product.description || `${product.name}의 색감과 형태를 살린 감성 플라워 구성입니다.`}</p>
        </div>

       <div className={styles.priceArea}>
        {
          product.discountRate > 0 && (
            <>
             <span>{product.discountRate}%</span>
             <del>{product.price.toLocaleString()}원</del>
            </>
          )
        }

        <strong>{discountprice.toLocaleString()}원</strong>
        </div>

        <div className={styles.deliveryArea} >
           <span>배송비</span>
           <strong>50,00원 이상 무료배송</strong>
        </div>

        <div className={styles.quantityArea} >
           <span>수량</span>
           {isSoldOut ? (
            <strong className={styles.soldOutText}>품절</strong>
           ) : (
            <QuantityControl quantity={quantity} setQuantity={setQuantity} maxQuantity={maxQuantity} />
           )}
           {/* 수량 변경은 QuantityControl에서 하고, 실제 수량 값은 부모인 ProductDetail이 quantity 상태로 관리합니다. */}
           <small>재고 {maxQuantity}개</small>
        </div>

        <div className={styles.totalArea}>
          <h2>총 상품금액 {totalprice.toLocaleString()}원</h2>
        </div>

        <div className={styles.actionArea}>
          <button type="button" className={styles.wishButton} onClick={toggleWishlist}>
          {
            isLiked ? '♥ 찜완료' : '♡ 찜하기'
          }
          </button>
          <button type="button" className={styles.cartButton} onClick={ addTocart } disabled={isSoldOut}>{isSoldOut ? '품절' : '장바구니 담기'}</button>
          <button type="button" className={styles.buyButton} disabled={isSoldOut}>{isSoldOut ? '품절' : '바로 구매'}</button>
        </div>
      </div>


      <div className={styles.detailSection}>
        <div className={styles.sectionTitle}>
          <p>{isMessageCard ? 'CARD DESIGN' : 'FLOWER COMPOSITION'}</p>
          <h3>{isMessageCard ? '카드 구성' : '꽃 구성'}</h3>
        </div>
        {isMessageCard ? (
          <>
            <div className={styles.cardFrontBack}>
              <div className={styles.cardPanel}>
                <span className={styles.cardLabel}>FRONT · 앞면</span>
                <div className={styles.cardPanelFront}>
                  <img src={product.image} alt={product.name} />
                </div>
                {cardFrontItem?.name && <p className={styles.cardPanelCaption}>{cardFrontItem.name}</p>}
              </div>
              <div className={styles.cardPanel}>
                <span className={styles.cardLabel}>BACK · 뒷면</span>
                <div className={styles.cardPanelBack}>
                  <p className={styles.cardPanelBackText}>마음을 담아<br />적어보세요</p>
                </div>
                {cardBackItem?.note && <p className={styles.cardPanelCaption}>{cardBackItem.note}</p>}
              </div>
            </div>
            {cardSpec && (
              <dl className={styles.cardSpecGrid}>
                <div>
                  <dt>사이즈</dt>
                  <dd>{cardSpec.size}</dd>
                </div>
                <div>
                  <dt>재질</dt>
                  <dd>{cardSpec.material}</dd>
                </div>
                <div>
                  <dt>봉투</dt>
                  <dd>{cardSpec.envelope}</dd>
                </div>
              </dl>
            )}
          </>
        ) : hasFlowerDiagram ? (
          <>
            <div className={styles.flowerDiagram}>
              <svg
                className={styles.flowerDiagramLines}
                viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {flowerDiagramItems.map((item) => (
                  <line key={item.name} x1={item.pinX} y1={item.pinY} x2={item.anchorX} y2={item.anchorY} />
                ))}
              </svg>
              <div
                className={styles.flowerDiagramPhoto}
                style={{ left: PHOTO_LEFT, top: PHOTO_TOP, width: PHOTO_W, height: PHOTO_H }}
              >
                <img src={product.image} alt={product.name} />
                {flowerDiagramItems.map((item) => (
                  <span
                    key={item.name}
                    className={styles.flowerDiagramPin}
                    style={{ left: `${item.pos.x}%`, top: `${item.pos.y}%` }}
                  />
                ))}
              </div>
              {flowerDiagramItems.map((item) => (
                <div
                  key={item.name}
                  className={styles.flowerDiagramCallout}
                  style={{ left: item.boxX, top: item.boxY, width: CALLOUT_SIZE }}
                >
                  <span
                    className={styles.flowerDiagramZoom}
                    style={{
                      backgroundImage: `url(${product.image})`,
                      backgroundPosition: `${item.pos.x}% ${item.pos.y}%`,
                    }}
                  />
                  <div className={styles.flowerDiagramCaption}>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <ul className={styles.flowerDiagramMobile}>
              {flowerItems.map((item) => (
                <li key={item.name} className={styles.flowerDiagramMobileItem}>
                  <span
                    className={styles.flowerDiagramMobileZoom}
                    style={{
                      backgroundImage: `url(${product.image})`,
                      backgroundPosition: `${item.pos.x}% ${item.pos.y}%`,
                    }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={styles.flowerGrid}>
            {flowerItems.map((item) => (
              <article key={item.name} className={styles.flowerCard}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {packagingImages.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.sectionTitle}>
            <p>PACKAGING</p>
            <h3>포장 안내</h3>
          </div>
          <div className={styles.packagingGrid}>
            {packagingImages.map((item) => (
              <React.Fragment key={item.src}>
                <img className={styles.packagingImage} src={item.src} alt={item.caption} />
                <p className={styles.packagingCaption}>{item.caption}</p>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetail;










