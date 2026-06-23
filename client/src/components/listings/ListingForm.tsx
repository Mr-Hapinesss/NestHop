import React, { useState, useRef } from 'react';
import { X, Upload, Plus, MapPin } from 'lucide-react';
import MapPicker from './MapPicker';
import { listingService } from '../../services/listing.service';
import { HOUSE_TYPES } from '../../utils/helpers';
import type { HouseType, Listing } from '../../types';
import toast from 'react-hot-toast';

interface ListingFormProps {
  listing?: Listing;
  onSuccess: (listing: Listing) => void;
  onCancel: () => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ listing, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    title: listing?.title || '',
    description: listing?.description || '',
    price: listing?.price || '',
    houseType: listing?.houseType || 'Single Room',
    address: listing?.location.address || '',
    city: listing?.location.city || '',
    area: listing?.location.area || '',
    lat: listing?.location.lat || -1.2921,
    lng: listing?.location.lng || 36.8219,
    notes: listing?.notes || '',
    amenities: listing?.amenities?.join(', ') || '',
    isAvailable: listing?.isAvailable ?? true,
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(listing?.images || []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeExisting = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.city || !form.area) {
      toast.error('Fill in all required fields');
      return;
    }
    if (existingImages.length + images.length === 0) {
      toast.error('Add at least one image');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      existingImages.forEach(url => fd.append('existingImages', url));
      images.forEach(img => fd.append('images', img));

      let res;
      if (listing) {
        res = await listingService.update(listing._id, fd);
      } else {
        res = await listingService.create(fd);
      }

      if (res.success) {
        toast.success(listing ? 'Listing updated!' : 'Listing created!');
        onSuccess(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid var(--border-color)',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    fontFamily: "'Neuton', serif", fontSize: 15, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Neuton', serif",
    fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'grid', gap: 20 }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Listing Title *</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Spacious 2-bedroom in Kilimani"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the property in detail..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Price + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Monthly Rent (KES) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="25000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>House Type</label>
            <select
              value={form.houseType}
              onChange={e => setForm(f => ({ ...f, houseType: e.target.value as HouseType }))}
              style={inputStyle}
            >
              {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>City *</label>
            <input
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="Nairobi"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Area/Neighbourhood *</label>
            <input
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              placeholder="Kilimani"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Map Picker */}
        <div>
          <label style={labelStyle}><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />Pin Exact Location</label>
          <MapPicker
            lat={form.lat}
            lng={form.lng}
            onChange={(lat, lng, address) => setForm(f => ({ ...f, lat, lng, address }))}
          />
          {form.address && (
            <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Neuton', serif" }}>
              📍 {form.address}
            </p>
          )}
        </div>

        {/* Images */}
        <div>
          <label style={labelStyle}>Photos *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            {existingImages.map(url => (
              <div key={url} style={{ position: 'relative', width: 100, height: 80 }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => removeExisting(url)} style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#ef4444', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {previews.map((p, i) => (
              <div key={i} style={{ position: 'relative', width: 100, height: 80 }}>
                <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => removeNewImage(i)} style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#ef4444', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: 100, height: 80, borderRadius: 8,
                border: '2px dashed var(--border-color)',
                background: 'var(--bg-secondary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: 4, color: 'var(--text-muted)',
              }}
            >
              <Plus size={20} />
              <span style={{ fontSize: 11, fontFamily: "'Neuton', serif" }}>Add Photo</span>
            </button>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
        </div>

        {/* Amenities */}
        <div>
          <label style={labelStyle}>Amenities (comma separated)</label>
          <input
            value={form.amenities}
            onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
            placeholder="WiFi, Parking, Water 24/7, Security"
            style={inputStyle}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Side Notes (visible on detail page)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Move-in date, pet policy, negotiation room..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Available for Rent</label>
          <button
            onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
            style={{
              width: 44, height: 24, borderRadius: 99,
              background: form.isAvailable ? '#4F252E' : 'var(--border-color)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: form.isAvailable ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#FFF7C5', transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px', borderRadius: 10,
              border: '1.5px solid var(--border-color)',
              background: 'transparent', color: 'var(--text-primary)',
              cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 15,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px 28px', borderRadius: 10,
              background: loading ? '#ccc' : '#4F252E',
              color: '#FFF7C5', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
            }}
          >
            {loading ? 'Saving...' : listing ? 'Update Listing' : 'Publish Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingForm;