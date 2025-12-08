// src/pages/PostListPage.jsx
import { useState } from 'react';
import PostListItem from '../components/post/PostListItem';
import Pagination from '../components/common/Pagination';

// 임시 목데이터 (API 나오기 전까지 사용)
const mockPosts = [
  {
    postId: 1,
    title: '제목입니다',
    nickname: '홍길동',
    createdAt: '2025-07-02T09:00:00',
  },
  {
    postId: 2,
    title: '다이어트 꿀팁',
    nickname: '다이어터123',
    createdAt: '2025-07-01T15:00:00',
  },
];

function PostListPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="post-list-page">
      <header className="post-list-header">
        <h1>게시글 목록</h1>
      </header>

      <main>
        <ul className="post-list">
          {mockPosts.map((post) => (
            <PostListItem key={post.postId} post={post} />
          ))}
        </ul>

        <Pagination page={page} totalPages={6} onPageChange={setPage} />
      </main>
    </div>
  );
}

export default PostListPage;
