import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, DollarSign } from 'lucide-react';
import type { Listing } from '../../types';
import { formatPrice, formatTimeAgo } from '../../utils/helpers';

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div
      className="listing-card"
      onClick={() => navigate(`/listing/${listing._id}`)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={listing.images[0] || '/placeholder-house.jpg'}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* House type badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: '#4F252E', color: '#FFF7C5',
          padding: '4px 10px', borderRadius: 99,
          fontFamily: "'Neuton', serif", fontSize: 11, fontWeight: 700,
        }}>
          {listing.houseType}
        </div>
        {/* Availability */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: listing.isAvailable ? '#22c55e' : '#ef4444',
          width: 10, height: 10, borderRadius: '50%',
          boxShadow: `0 0 0 3px ${listing.isAvailable ? '#dcfce7' : '#fee2e2'}`,
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 16, fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {listing.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <MapPin size={13} color="var(--text-muted)" />
          <span style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)' }}>
            {listing.location.area}, {listing.location.city}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: 18, color: '#4F252E',
            }}>
              {formatPrice(listing.price)}
            </span>
            <span style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)' }}>/mo</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#4F252E22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 11, color: '#4F252E',
            }}>
              {listing.landlord?.name?.charAt(0)}
            </div>
            <span style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)' }}>
              {formatTimeAgo(listing.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;