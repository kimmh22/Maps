// src/pages/MyBoardListPage.jsx
import { useEffect, useState } from 'react';
import Pagination from '../../components/common/Pagination';
import '../../styles/MyBoardListPage.css';
import apiClient from '../../services/apiClient';

function MyBoardListPage() {
  const [page, setPage] = useState(1);
  const totalPages = 1; // 일단 글 1개라 1페이지로 고정
  const [totalCount, setTotalCount] = useState(0);

  const [posts, setPosts] = useState([]);

  // 1) 마운트 시 백엔드에서 데이터 가져오기
  useEffect(() => {
    async function loadMyBoards() {
      try {
        console.log('👉 /board/1 호출 시작');

        // baseURL + '/board/1' => http://localhost:8080/api/travly/board/1
        const res = await apiClient.get('/board/6');

        console.log('✅ 응답 status:', res.status);
        console.log('✅ 응답 data:', res.data);

        const data = res.data;

        // 썸네일: 첫 번째 place의 첫 번째 파일 기준
        const firstPlace = data.places?.[0];
        const firstFile = firstPlace?.files?.[0];

        const thumbnailUrl = firstFile
          ? `/api/travly/file/${firstFile.file.id}` // 백엔드 파일 다운로드 URL 규칙에 맞게 수정
          : 'https://via.placeholder.com/160x100?text=No+Image';

        // 리스트 화면에서 쓸 형태로 가공
        const mappedPost = {
          id: data.id,
          title: data.title,
          subtitle: firstPlace?.content || '',
          thumbnail: thumbnailUrl,
          nickname: data.member?.nickname || '익명',
          profileImage: null, // 나중에 profileImage 나오면 여기 넣기
          createdAt: data.createdAt?.slice(0, 10) || '',
          views: data.viewCount ?? 0,
          likes: 0, // 좋아요 기능 붙이면 변경
          tag: '여행코스',
        };

        setPosts([mappedPost]);
        setTotalCount(1);
      } catch (err) {
        console.error('🔴 내가 작성한 글 불러오기 실패 (AxiosError):', err);
        console.log('🔴 서버 응답 status:', err.response?.status);
        console.log('🔴 서버 응답 data:', err.response?.data);
        alert('내가 작성한 글을 불러오는 중 오류가 발생했습니다.');
      }
    }

    loadMyBoards();
  }, []);

  return (
    <div className="my-board-page">
      {/* 상단 영역 */}
      <div className="my-board-header">
        <div className="my-board-breadcrumb">My list</div>
        <h1 className="my-board-title">내가 작성한 글</h1>
        <button className="my-board-count-btn">
          총 <span>{totalCount}</span>건
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="my-board-list">
        {posts.map((post, idx) => (
          <article key={`${post.id}-${idx}`} className="my-board-item">
            {/* 썸네일 */}
            <div className="my-board-thumb-wrap">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="my-board-thumb"
              />
            </div>

            {/* 본문 */}
            <div className="my-board-content">
              <div className="my-board-top-row">
                <span className="my-board-tag">{post.tag}</span>
              </div>

              <h2 className="my-board-item-title">{post.title}</h2>
              <p className="my-board-item-subtitle">{post.subtitle}</p>

              <div className="my-board-meta-row">
                <div className="my-board-profile">
                  {post.profileImage && (
                    <img
                      src={post.profileImage}
                      alt={post.nickname}
                      className="my-board-profile-img"
                    />
                  )}
                  <span className="my-board-nickname">{post.nickname}</span>
                </div>
                <div className="my-board-meta">
                  <span>{post.createdAt}</span>
                  <span>· 조회 {post.views}</span>
                  <span>· 좋아요 {post.likes}</span>
                </div>
              </div>
            </div>

            {/* 오른쪽 버튼 */}
            <div className="my-board-right">
              <button className="my-board-detail-btn">보기</button>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="my-board-empty">작성한 글이 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="my-board-pagination-wrap">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default MyBoardListPage;
