// src/pages/MyBoardListPage.jsx
import { useState } from 'react';
import Pagination from '../components/common/Pagination';
import '../styles/MyBoardListPage.css';

const DUMMY_POSTS = [
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  {
    id: 1,
    title: '인터라켄에서 시작하지 않으면 오던 여r행코스',
    subtitle: '스위스 알프스를 느끼는 3박 4일 일정',
    thumbnail:
      'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress',
    nickname: 'travly_user',
    profileImage:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress',
    createdAt: '2025.12.01',
    views: 123,
    likes: 7,
    tag: '여행코스',
  },
  // 복붙해서 8~10개 정도 만들어도 됨
];

function MyBoardListPage() {
  const [page, setPage] = useState(1);
  const totalPages = 3; // 일단 고정
  const totalCount = 356; // 상단 “총 356건” 이런 숫자

  // 지금은 더미 데이터라 page랑 상관없이 DUMMY_POSTS만 사용
  const posts = DUMMY_POSTS;

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
        {posts.map((post) => (
          <article key={post.id} className="my-board-item">
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
                  <img
                    src={post.profileImage}
                    alt={post.nickname}
                    className="my-board-profile-img"
                  />
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
