import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { chatService } from '../../services/chat.service';
import { useAuth } from '../../context/AuthContext';
import OnlineIndicator from '../chat/OnlineIndicator';
import type { Listing } from '../../types';
import { formatPrice, formatDate } from '../../utils/helpers';
import { toast } from '../ui/Toast';

interface ListingDetailProps {
  listing: Listing;
  onAuthRequired: () => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listing, onAuthRequired }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const prevImg = () => setImgIdx(i => (i === 0 ? listing.images.length - 1 : i - 1));
  const nextImg = () => setImgIdx(i => (i === listing.images.length - 1 ? 0 : i + 1));

  const handleChat = async () => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    if (user?._id === listing.landlord._id) { toast.info("That's your own listing!"); return; }
    setStartingChat(true);
    try {
      const res = await chatService.getOrCreateConversation(listing._id, listing.landlord._id);
      if (res.success) navigate(`/chat?conv=${res.data._id}`);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: listing.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Image gallery */}
      <div style={{ position: 'relative', height: 420, background: '#111', borderRadius: '0 0 20px 20px', overflow: 'hidden', marginBottom: 28 }}>
        {listing.images.length > 0 ? (
          <img
            src={listing.images[imgIdx]}
            alt={`${listing.title} ${imgIdx + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏠</div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
          <span style={{ background: '#4F252E', color: '#FFF7C5', padding: '5px 12px', borderRadius: 99, fontFamily: "'Neuton', serif", fontSize: 12 }}>
            {listing.houseType}
          </span>
          <span style={{
            background: listing.isAvailable ? '#22c55e' : '#ef4444',
            color: '#fff', padding: '5px 12px', borderRadius: 99,
            fontFamily: "'Neuton', serif", fontSize: 12,
          }}>
            {listing.isAvailable ? 'Available' : 'Occupied'}
          </span>
        </div>

        {/* Share */}
        <button onClick={handleShare} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#4F252E',
        }}>
          {copied ? <Check size={16} /> : <Share2 size={16} />}
        </button>

        {/* Nav arrows */}
        {listing.images.length > 1 && (
          <>
            <button onClick={prevImg} style={arrowBtn('left')}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImg} style={arrowBtn('right')}>
              <ChevronRight size={20} />
            </button>
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {listing.images.map((_, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{
                  width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 99,
                  background: i === imgIdx ? '#FFF7C5' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {listing.images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 24, overflowX: 'auto' }}>
          {listing.images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
              style={{
                width: 72, height: 54, objectFit: 'cover', borderRadius: 8,
                cursor: 'pointer', flexShrink: 0,
                border: `2.5px solid ${i === imgIdx ? '#4F252E' : 'transparent'}`,
                opacity: i === imgIdx ? 1 : 0.65, transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
      )}

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, padding: '0 20px', alignItems: 'start' }}>
        <div>
          {/* Title & price */}
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: 'var(--text-primary)', marginBottom: 8 }}>
            {listing.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
            <MapPin size={15} color="#4F252E" />
            <span style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)' }}>
              {listing.location.area}, {listing.location.city}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
            <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 30, color: '#4F252E' }}>
              {formatPrice(listing.price)}
            </span>
            <span style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-muted)' }}>/month</span>
          </div>

          {/* Description */}
          {listing.description && (
            <Section title="About this property">
              <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {listing.description}
              </p>
            </Section>
          )}

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <Section title="Amenities">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {listing.amenities.map(a => (
                  <span key={a} style={{
                    padding: '6px 14px', borderRadius: 99,
                    background: '#4F252E10', color: '#4F252E',
                    fontFamily: "'Neuton', serif", fontSize: 13,
                    border: '1px solid #4F252E20',
                  }}>✓ {a}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          {listing.notes && (
            <Section title="">
              <div style={{ padding: '16px 18px', borderRadius: 12, background: '#FFF7C5', border: '1px solid #e8dc7a' }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color: '#4F252E', marginBottom: 6, fontWeight: 700 }}>
                  📝 Landlord's Notes
                </div>
                <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: '#5c3a1e', lineHeight: 1.65 }}>
                  {listing.notes}
                </p>
              </div>
            </Section>
          )}

          {/* Map */}
          <Section title="Location">
            {isLoaded ? (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: 260 }}
                  center={{ lat: listing.location.lat, lng: listing.location.lng }}
                  zoom={16}
                  options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
                >
                  <Marker
                    position={{ lat: listing.location.lat, lng: listing.location.lng }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 13,
                      fillColor: '#4F252E',
                      fillOpacity: 1,
                      strokeColor: '#FFF7C5',
                      strokeWeight: 3,
                    }}
                  />
                </GoogleMap>
              </div>
            ) : (
              <div style={{ height: 260, borderRadius: 14, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)' }}>Loading map...</span>
              </div>
            )}
            {listing.location.address && (
              <p style={{ marginTop: 8, fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {listing.location.address}
              </p>
            )}
          </Section>
        </div>

        {/* Landlord card */}
        <div style={{
          position: 'sticky', top: 80, width: 270,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 18, padding: 22,
          flexShrink: 0,
        }}>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Listed by
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#4F252E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 18, color: '#FFF7C5', flexShrink: 0,
            }}>
              {listing.landlord.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {listing.landlord.name}
              </div>
              <OnlineIndicator userId={listing.landlord._id} showLabel />
            </div>
          </div>

          <div style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
            Posted {formatDate(listing.createdAt)}
          </div>

          {user?._id !== listing.landlord._id && (
            <button onClick={handleChat} disabled={startingChat} style={{
              width: '100%', padding: '13px',
              borderRadius: 12, border: 'none',
              background: startingChat ? '#ccc' : '#4F252E',
              color: '#FFF7C5', cursor: startingChat ? 'not-allowed' : 'pointer',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(79,37,46,0.25)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!startingChat) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <MessageCircle size={17} />
              {startingChat ? 'Opening...' : 'Chat with Landlord'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    {title && (
      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
        {title}
      </h3>
    )}
    {children}
  </div>
);

const arrowBtn = (side: 'left' | 'right'): React.CSSProperties => ({
  position: 'absolute', top: '50%', [side]: 12,
  transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.85)', border: 'none',
  borderRadius: '50%', width: 38, height: 38,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#4F252E',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
});

export default ListingDetail;