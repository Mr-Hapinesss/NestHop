import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../services/listing.service';
import type { Listing, FilterState } from '../types';

export const useListings = (filters?: Partial<FilterState>, page = 1) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listingService.getAll(filters, page);
      if (res.success) {
        setListings(res.data.listings);
        setTotalPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { listings, loading, error, totalPages, total, refetch: fetch };
};