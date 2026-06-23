import React, { useState, useEffect } from 'react';
import { Trash2, Eye, MapPin } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Listing } from '../../types';
import { formatPrice, formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ContentModeration: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAllListings(p);
      if (res.success) {
        setListings(res.data.listings);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(page); }, [page]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteListing(id);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-muted)' }}>
        {total} total listings
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--bg-secondary)', animation: 'pulse-soft 1.5s ease infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map(listing => (
            <div key={listing._id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <img
                src={listing.images[0]}
                alt={listing.title}
                style={{ width: 64, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.title}
                </div>
                <div style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <MapPin size={11} />
                  {listing.location.area}, {listing.location.city}
                  <span style={{ marginLeft: 8 }}>{formatPrice(listing.price)}/mo</span>
                  <span style={{ marginLeft: 8 }}>{listing.houseType}</span>
                </div>
                <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  By {listing.landlord?.name} • {formatDate(listing.createdAt)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  style={{ padding: '7px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => handleDelete(listing._id, listing.title)}
                  style={{ padding: '7px', borderRadius: 8, border: '1px solid #ef444430', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentModeration;