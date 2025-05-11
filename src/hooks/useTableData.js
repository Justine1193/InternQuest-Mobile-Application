import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export const useTableData = (collectionName) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const snapshot = await getDocs(collection(db, collectionName));
      const fetchedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);

      // Fetch overview stats if needed
      if (collectionName === 'companies') {
        const studentsSnapshot = await getDocs(collection(db, 'users'));
        setOverviewStats({
          totalCompanies: fetchedData.length,
          totalStudents: studentsSnapshot.docs.length,
        });
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      setError("Failed to delete item. Please try again.");
      return false;
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, collectionName, id));
      }
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      return true;
    } catch (error) {
      setError("Failed to delete items. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionName]);

  return {
    data,
    isLoading,
    error,
    overviewStats,
    fetchData,
    handleDelete,
    handleBulkDelete,
  };
}; 