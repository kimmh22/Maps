// src/components/post/PostListItem.jsx

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('ko-KR');
}

function PostListItem({ post }) {
  return (
    <li className="post-list-item">
      {/* 썸네일 자리 */}
      <div className="post-thumbnail">
        <div className="thumbnail-placeholder">IMG</div>
      </div>

      {/* 글 정보 */}
      <div className="post-info">
        <h2 className="post-title">{post.title}</h2>

        <div className="post-meta">
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* 작성자 */}
      <div className="post-author">
        <span>{post.nickname}</span>
      </div>
    </li>
  );
}

export default PostListItem;
