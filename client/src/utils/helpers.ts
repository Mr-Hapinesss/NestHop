import { formatDistanceToNow, format } from 'date-fns';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatTimeAgo = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatChatTime = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return format(d, 'HH:mm');
  if (diff < 604800000) return format(d, 'EEE');
  return format(d, 'dd/MM/yy');
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return /^(\+254|0)[17]\d{8}$/.test(phone.replace(/\s/g, ''));
};

export const detectContactType = (value: string): 'email' | 'phone' | null => {
  if (validateEmail(value)) return 'email';
  if (validatePhone(value)) return 'phone';
  return null;
};

export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('0')) return '+254' + cleaned.slice(1);
  return cleaned;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const HOUSE_TYPES = [
  'Single Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedrooms',
  '3 Bedrooms',
  '4+ Bedrooms',
  'Studio',
] as const;

export const KENYAN_CITIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Machakos',
  'Malindi',
  'Kitale',
  'Garissa',
];