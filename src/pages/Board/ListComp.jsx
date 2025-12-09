// src/pages/ListComp.jsx
import { useEffect, useState } from 'react';
import PostListItem from '../../components/post/PostListItem';
import Pagination from '../../components/common/Pagination';
import apiClient from '../../services/apiClient';

function ListComp() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        // 백엔드에서 게시글 목록 가져오기
        // 예시: GET /board?page=0 이런 구조라고 가정
        const res = await apiClient.get('/board?page=1&size=10', {
          params: { page: page - 1 }, // 스프링 페이지 기본 0부터 시작한다고 가정
        });

        // 1) res.data 가 배열인 경우  : [ {id, title, created_at, ...}, ... ]
        // 2) res.data 가 Page 객체인 경우: { content: [...], totalPages: 3, ... }
        const rawList = Array.isArray(res.data) ? res.data : res.data.content;

        // PostListItem에서 쓰기 좋은 형태로 매핑
        const mapped = rawList.map((b) => ({
          postId: b.id,
          title: b.title,
          nickname: b.nickname || b.memberNickname || '익명',
          createdAt: b.createdAt || b.created_at,
        }));

        setPosts(mapped);

        // 페이지 정보 있으면 사용
        if (
          !Array.isArray(res.data) &&
          typeof res.data.totalPages === 'number'
        ) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages(1); // 단순 배열이면 일단 1페이지로
        }
      } catch (err) {
        console.error(err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [page]);

  return (
    <div className="post-list-page">
      <header className="post-list-header">
        <h1>게시글 목록</h1>
      </header>

      <main>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <ul className="post-list">
          {posts.map((post) => (
            <PostListItem key={post.postId} post={post} />
          ))}
        </ul>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

export default ListComp;
