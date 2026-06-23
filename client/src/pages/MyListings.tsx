import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Menu } from 'lucide-react';
import { listingService } from '../services/listing.service';
import ListingForm from '../components/listings/ListingForm';
import type { Listing } from '../types';
import { formatPrice, formatDate } from '../utils/helpers';
import Logo from '../components/ui/Logo';
import Sidebar from '../components/ui/Sidebar';
import toast from 'react-hot-toast';

const MyListings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get('create') === 'true');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    listingService.getMyListings()
      .then(res => { if (res.success) setListings(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSuccess = (listing: Listing) => {
    if (editingListing) {
      setListings(prev => prev.map(l => l._id === listing._id ? listing : l));
    } else {
      setListings(prev => [listing, ...prev]);
    }
    setShowForm(false);
    setEditingListing(null);
    setSearchParams({});
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6 }}>
          <Menu size={22} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { setShowForm(true); setEditingListing(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 10,
            background: '#4F252E', color: '#FFF7C5',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
          }}
        >
          <Plus size={15} /> New Listing
        </button>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
          My Listings
        </h1>
        <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>
          Manage your rental properties
        </p>

        {(showForm || editingListing) && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20, padding: 28, marginBottom: 28,
          }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: 'var(--text-primary)', marginBottom: 24 }}>
              {editingListing ? 'Edit Listing' : 'Create New Listing'}
            </h2>
            <ListingForm
              {...(editingListing ? { listing: editingListing } : {})}
              onSuccess={handleSuccess}
              onCancel={() => { setShowForm(false); setEditingListing(null); setSearchParams({}); }}
            />
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: 100, borderRadius: 12, background: 'var(--bg-secondary)', animation: 'pulse-soft 1.5s ease infinite' }} />
            ))}
          </div>
        ) : listings.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
              No listings yet
            </h3>
            <p style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)', marginBottom: 20 }}>
              Create your first listing to start receiving tenant inquiries.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '12px 24px', borderRadius: 10,
                background: '#4F252E', color: '#FFF7C5',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Plus size={15} /> Create Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {listings.map(listing => (
              <div key={listing._id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 20,
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <img
                  src={listing.images[0] || '/placeholder-house.jpg'}
                  alt={listing.title}
                  style={{ width: 80, height: 70, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {listing.title}
                  </div>
                  <div style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {listing.houseType} • {listing.location.area}, {listing.location.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 16, color: '#4F252E' }}>
                      {formatPrice(listing.price)}/mo
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99,
                      background: listing.isAvailable ? '#22c55e18' : '#ef444418',
                      color: listing.isAvailable ? '#22c55e' : '#ef4444',
                      fontFamily: "'Neuton', serif", fontSize: 11,
                    }}>
                      {listing.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => navigate(`/listing/${listing._id}`)} style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Eye size={16} />
                  </button>
                  <button onClick={() => { setEditingListing(listing); setShowForm(false); }} style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: '#4F252E' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(listing._id)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ef444430', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;