// Hooki aplikacji (ESM pod Vite)
// - createId: pomocnicze ID
// - useFetch: pobranie danych z API z obsługą loading/error i refetch
import { useEffect, useMemo, useState, useCallback } from 'react'

// Pomocnicze ID
export const createId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2));

// Hook useFetch – pobiera dane z API (loading/error + refetch)
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      setData(json);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}




