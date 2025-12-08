function Pagination({ page, totalPages, onPageChange }) {
  const goPrev = () => page > 1 && onPageChange(page - 1);
  const goNext = () => page < totalPages && onPageChange(page + 1);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="Pagination">
      <button onClick={goPrev}>‹</button>

      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'active' : ''}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button onClick={goNext}>›</button>
    </nav>
  );
}

export default Pagination;
