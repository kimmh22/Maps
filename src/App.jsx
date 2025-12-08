import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '../src/styles/markers.css';
import PlannerMap from '../src/components/PlannerMap';
import PostListPage from './pages/PostListPage';
import MyBoardListPage from './pages/MyBoardListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 지도 페이지 */}
        <Route path="/" element={<PlannerMap />} />

        {/* 게시글 리스트 페이지 */}
        <Route path="/posts" element={<PostListPage />} />
        {/* 내가 작성한 글 리스트*/}
        <Route path="/my-list" element={<MyBoardListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
