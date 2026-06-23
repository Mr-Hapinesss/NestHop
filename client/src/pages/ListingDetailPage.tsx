import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageCircle, Heart, Share2, Wifi, Car, Droplets, Shield } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { listingService } from '../services/listing.service';
import { chatService } from '../services/chat.service';
import { useAuth } from '../context/AuthContext';
import type { Listing } from '../types';
import { formatPrice, formatDate } from '../utils/helpers';
import OnlineIndicator from '../components/chat/OnlineIndicator';
import AuthModal from '../components/auth/AuthModal';
import toast from 'react-hot-toast';
import { Menu } from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import Logo from '../components/ui/Logo';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  useEffect(() => {
    if (!id) return;
    listingService.getById(id)
      .then(res => { if (res.success) setListing(res.data); })
      .catch(() => toast.error('Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    if (!listing) return;
    if (user?._id === listing.landlord._id) {
      toast('That\'s your own listing!');
      return;
    }
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🏚</div>
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", color: 'var(--text-primary)' }}>Listing not found</h2>
        <button onClick={() => navigate('/dashboard')} style={{ color: '#4F252E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 15 }}>
          ← Back to listings
        </button>
      </div>
    );
  }

  const amenityIcons: Record<string, React.ElementType> = {
    wifi: Wifi, parking: Car, water: Droplets, security: Shield,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6 }}>
          <Menu size={22} />
        </button>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6 }}>
          <ArrowLeft size={20} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8 }} onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}>
          <Share2 size={18} />
        </button>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>

        {/* Image gallery */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ position: 'relative', height: 400 }}>
            <img
              src={listing.images[activeImage] || '/placeholder-house.jpg'}
              alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: '#4F252E', color: '#FFF7C5',
              padding: '5px 12px', borderRadius: 99,
              fontFamily: "'Neuton', serif", fontSize: 12,
            }}>
              {listing.houseType}
            </div>
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: listing.isAvailable ? '#22c55e' : '#ef4444',
              color: '#fff', padding: '5px 12px', borderRadius: 99,
              fontFamily: "'Neuton', serif", fontSize: 12,
            }}>
              {listing.isAvailable ? 'Available' : 'Taken'}
            </div>
          </div>

          {listing.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: 12, background: 'var(--bg-secondary)', overflowX: 'auto' }}>
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`View ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 80, height: 60, objectFit: 'cover',
                    borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                    border: `2px solid ${i === activeImage ? '#4F252E' : 'transparent'}`,
                    transition: 'border-color 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          <div>
            {/* Title & price */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
                {listing.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <MapPin size={16} color="#4F252E" />
                <span style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)' }}>
                  {listing.location.area}, {listing.location.city}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 32, color: '#4F252E' }}>
                  {formatPrice(listing.price)}
                </span>
                <span style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-muted)' }}>/ month</span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: 'var(--text-primary)', marginBottom: 10 }}>
                  About this property
                </h3>
                <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Amenities
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{
                      padding: '6px 14px', borderRadius: 99,
                      background: '#4F252E12', color: '#4F252E',
                      fontFamily: "'Neuton', serif", fontSize: 13,
                      border: '1px solid #4F252E28',
                    }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {listing.notes && (
              <div style={{
                padding: 20, borderRadius: 12,
                background: '#FFF7C5', border: '1px solid #e8dc7a',
                marginBottom: 24,
              }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: '#4F252E', marginBottom: 8 }}>
                  📝 Landlord Notes
                </h3>
                <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: '#5c3a1e', lineHeight: 1.6 }}>
                  {listing.notes}
                </p>
              </div>
            )}

            {/* Map */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
                Location
              </h3>
              {isLoaded ? (
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: 260 }}
                    center={{ lat: listing.location.lat, lng: listing.location.lng }}
                    zoom={16}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    <Marker
                      position={{ lat: listing.location.lat, lng: listing.location.lng }}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: '#4F252E',
                        fillOpacity: 1,
                        strokeColor: '#FFF7C5',
                        strokeWeight: 3,
                      }}
                    />
                  </GoogleMap>
                </div>
              ) : (
                <div style={{ height: 260, borderRadius: 16, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)' }}>Loading map...</span>
                </div>
              )}
              <p style={{ marginTop: 8, fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {listing.location.address || `${listing.location.area}, ${listing.location.city}`}
              </p>
            </div>
          </div>

          {/* Sticky landlord card */}
          <div style={{
            position: 'sticky', top: 80,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20, padding: 24,
            width: 280, flexShrink: 0,
          }}>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Listed by
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#4F252E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: '#FFF7C5',
                flexShrink: 0,
              }}>
                {listing.landlord.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {listing.landlord.name}
                </div>
                <OnlineIndicator userId={listing.landlord._id} showLabel />
              </div>
            </div>

            <div style={{ marginBottom: 20, fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)' }}>
              Posted {formatDate(listing.createdAt)}
            </div>

            {user?._id !== listing.landlord._id && (
              <button
                onClick={handleChat}
                disabled={startingChat}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 12, border: 'none',
                  background: startingChat ? '#ccc' : '#4F252E',
                  color: '#FFF7C5', cursor: startingChat ? 'not-allowed' : 'pointer',
                  fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(79,37,46,0.25)',
                }}
              >
                <MessageCircle size={18} />
                {startingChat ? 'Opening chat...' : 'Chat with Landlord'}
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default ListingDetailPage;