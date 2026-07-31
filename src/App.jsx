import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import MyPage from './pages/MyPage';
import Admin from './pages/Admin';
import AdminMembers from './pages/AdminMembers';

import AdminProducts from './pages/AdminProducts';
import AdminRecommended from './pages/AdminRecommended';
import AdminNotices from './pages/AdminNotices';

import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import SearchResult from './pages/SearchResult';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/recommended" element={<AdminRecommended />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
        </Route>
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/notice/:id" element={<NoticeDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/category/:category" element={<Products />} />
        <Route path="/search/:keyword" element={<SearchResult />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;









