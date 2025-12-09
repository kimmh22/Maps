import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '../src/styles/markers.css';
import PlannerMap from '../src/components/PlannerMap';
import ListComp from './pages/Board/ListComp';
import MyBoardListPage from './pages/Board/MyBoardListPage';

import ModifyComp from './pages/Board/ModifyComp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 지도 페이지 */}
        <Route path="/" element={<PlannerMap />} />

        {/* 게시글 리스트 페이지 */}
        <Route path="/posts" element={<ListComp />} />
        {/* 내가 작성한 글 리스트*/}
        <Route path="/my-list" element={<MyBoardListPage />} />

        {/* ✨ 글 수정 페이지 (타임라인 edit 모드로 사용) */}
        <Route path="/boards/:boardId/edit" element={<ModifyComp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
