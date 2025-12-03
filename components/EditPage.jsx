import { useEffect, useState } from 'react';
import PlannerMap from './PlannerMap';

function EditPage({ postId }) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const res = await fetch(`/api/post/${postId}`);
      const data = await res.json();

      setInitialData(data);
      setLoading(false);
    }

    loadData();
  }, [postId]);

  if (loading) return <div>로딩중.....</div>;

  return <PlannerMap mode="edit" initialData={initialData} />;
}
export default EditPage;
