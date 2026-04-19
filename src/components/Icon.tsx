import React from 'react';
import {
  Plus, Minus, Check, X,
  ChevronDown, ChevronRight, ChevronLeft,
  Search, Bluetooth, Printer, Settings2,
  Receipt, History, User, Building2, Image,
  Trash2, Pencil, MoreHorizontal, DollarSign, CreditCard,
  ArrowRight, ArrowLeft, Download, Upload,
  Eye, Zap, Clock, Tag, RefreshCw,
  Wifi, Signal, Battery, Copy, BarChart2,
  PlusCircle,
  LucideProps,
} from 'lucide-react-native';

type IconName =
  | 'plus' | 'minus' | 'check' | 'x'
  | 'chevron_down' | 'chevron_right' | 'chevron_left'
  | 'search' | 'bluetooth' | 'printer' | 'settings'
  | 'receipt' | 'history' | 'user' | 'building' | 'image'
  | 'trash' | 'edit' | 'more' | 'dollar' | 'card'
  | 'arrow_right' | 'arrow_left' | 'download' | 'upload'
  | 'eye' | 'zap' | 'clock' | 'tag' | 'refresh'
  | 'wifi' | 'signal' | 'battery' | 'copy' | 'chart'
  | 'plus-circle';

type LucideComponent = React.ComponentType<LucideProps>;

const MAP: Record<IconName, LucideComponent> = {
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
  chevron_down: ChevronDown,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  search: Search,
  bluetooth: Bluetooth,
  printer: Printer,
  settings: Settings2,
  receipt: Receipt,
  history: History,
  user: User,
  building: Building2,
  image: Image,
  trash: Trash2,
  edit: Pencil,
  more: MoreHorizontal,
  dollar: DollarSign,
  card: CreditCard,
  arrow_right: ArrowRight,
  arrow_left: ArrowLeft,
  download: Download,
  upload: Upload,
  eye: Eye,
  zap: Zap,
  clock: Clock,
  tag: Tag,
  refresh: RefreshCw,
  wifi: Wifi,
  signal: Signal,
  battery: Battery,
  copy: Copy,
  chart: BarChart2,
  'plus-circle': PlusCircle,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = '#000', strokeWidth = 1.75 }: IconProps) {
  const LucideIcon = MAP[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
