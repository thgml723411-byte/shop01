import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBox.module.scss';

const SearchBox = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const keyword = searchKeyword.trim();
    if (keyword === '') {
      return;
    }

    navigate(`/search/${encodeURIComponent(keyword)}`);
    setSearchKeyword('');
  };
  // http:aaa.vercel.app/search/마우스 주소의제일끝에들고오는것

  return (
    <form className={styles.SearchBox} onSubmit={handleSubmit}>
      <input
        type="search"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="꽃 이름이나 색감을 검색하세요"
      />
      <button type="submit">검색</button>
    </form>
  );
};

export default SearchBox;

//서치박스에서리저트로가