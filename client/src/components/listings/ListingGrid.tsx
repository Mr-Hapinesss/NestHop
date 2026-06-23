import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ListingCard from './ListingCard';
import { listingService } from '../../services/listing.service';
import type { Listing, FilterState } from '../../types';
import { HOUSE_TYPES, KENYAN_CITIES } from '../../utils/helpers';

const ListingGrid: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    city: '', area: '', houseType: '', minPrice: '', maxPrice: '',
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listingService.getAll(filters, page);
      if (res.success) {
        setListings(res.data.listings);
        setTotalPages(res.data.pages);
      }
    } catch {
      console.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearFilters = () => {
    setFilters({ city: '', area: '', houseType: '', minPrice: '', maxPrice: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filteredListings = listings.filter(l =>
    !searchText ||
    l.title.toLowerCase().includes(searchText.toLowerCase()) ||
    l.location.area.toLowerCase().includes(searchText.toLowerCase()) ||
    l.location.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid var(--border-color)',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none',
  };

  return (
    <div>
      {/* Search + Filter bar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search by name, area, city..."
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10,
            border: `1.5px solid ${hasActiveFilters ? '#4F252E' : 'var(--border-color)'}`,
            background: hasActiveFilters ? '#4F252E' : 'var(--bg-card)',
            color: hasActiveFilters ? '#FFF7C5' : 'var(--text-primary)',
            cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14,
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && <span style={{ background: '#FFF7C5', color: '#4F252E', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: "'Archivo Black', sans-serif" }}>
            {Object.values(filters).filter(v => v !== '').length}
          </span>}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid var(--border-color)',
            background: 'transparent', color: 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 13,
          }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 16, padding: 20, marginBottom: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12,
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>City</label>
            <select
              value={filters.city}
              onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              style={inputStyle}
            >
              <option value="">All Cities</option>
              {KENYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>Area</label>
            <input
              type="text"
              value={filters.area}
              onChange={e => setFilters(f => ({ ...f, area: e.target.value }))}
              placeholder="e.g. Westlands"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>House Type</label>
            <select
              value={filters.houseType}
              onChange={e => setFilters(f => ({ ...f, houseType: e.target.value as any }))}
              style={inputStyle}
            >
              <option value="">All Types</option>
              {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>Min Price (KES)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value ? Number(e.target.value) : '' }))}
              placeholder="0"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>Max Price (KES)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : '' }))}
              placeholder="200,000"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ marginBottom: 16, fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-muted)' }}>
        {loading ? 'Loading...' : `${filteredListings.length} properties found`}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              height: 320, borderRadius: 16,
              background: 'var(--bg-secondary)',
              animation: 'pulse-soft 1.5s ease infinite',
            }} />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
            No properties found
          </h3>
          <p style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)', fontSize: 15 }}>
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredListings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: p === page ? '#4F252E' : 'var(--border-color)',
                    background: p === page ? '#4F252E' : 'transparent',
                    color: p === page ? '#FFF7C5' : 'var(--text-primary)',
                    cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingGrid;