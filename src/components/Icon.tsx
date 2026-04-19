import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

type IconName =
  | 'plus' | 'minus' | 'check' | 'x'
  | 'chevron_down' | 'chevron_right' | 'chevron_left'
  | 'search' | 'bluetooth' | 'printer' | 'settings'
  | 'receipt' | 'history' | 'user' | 'building' | 'image'
  | 'trash' | 'edit' | 'more' | 'dollar' | 'card'
  | 'arrow_right' | 'arrow_left' | 'download' | 'upload'
  | 'eye' | 'zap' | 'clock' | 'tag' | 'refresh'
  | 'wifi' | 'signal' | 'battery' | 'copy' | 'chart';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color = 'currentColor' }: IconProps) {
  const stroke = color;
  const sw = '2';
  const cap = 'round';
  const join = 'round';

  const props = { stroke, strokeWidth: sw, strokeLinecap: cap as 'round', strokeLinejoin: join as 'round', fill: 'none' };

  const icons: Record<IconName, React.ReactNode> = {
    plus: <Path d="M12 5v14M5 12h14" {...props} />,
    minus: <Path d="M5 12h14" {...props} />,
    check: <Path d="M5 12l5 5L20 7" {...props} />,
    x: <Path d="M6 6l12 12M6 18L18 6" {...props} />,
    chevron_down: <Path d="M6 9l6 6 6-6" {...props} />,
    chevron_right: <Path d="M9 6l6 6-6 6" {...props} />,
    chevron_left: <Path d="M15 6l-6 6 6 6" {...props} />,
    search: (
      <G {...props}>
        <Circle cx="11" cy="11" r="7" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M20 20l-3.5-3.5" />
      </G>
    ),
    bluetooth: <Path d="M7 7l10 10-5 5V2l5 5L7 17" {...props} />,
    printer: (
      <G {...props}>
        <Path d="M6 9V3h12v6" />
        <Rect x="4" y="9" width="16" height="9" rx="1" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M7 14h10v6H7z" />
      </G>
    ),
    settings: (
      <G {...props}>
        <Circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </G>
    ),
    receipt: <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h4" {...props} />,
    history: (
      <G {...props}>
        <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <Path d="M3 3v5h5" />
        <Path d="M12 7v5l3 2" />
      </G>
    ),
    user: (
      <G {...props}>
        <Circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M4 21a8 8 0 0 1 16 0" />
      </G>
    ),
    building: (
      <G {...props}>
        <Rect x="4" y="3" width="16" height="18" rx="1" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      </G>
    ),
    image: (
      <G {...props}>
        <Rect x="3" y="4" width="18" height="16" rx="2" stroke={stroke} strokeWidth={sw} fill="none" />
        <Circle cx="9" cy="10" r="2" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M21 17l-5-5-9 9" />
      </G>
    ),
    trash: <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...props} />,
    edit: <Path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" {...props} />,
    more: (
      <G {...props}>
        <Circle cx="5" cy="12" r="1.5" stroke={stroke} strokeWidth={sw} fill="none" />
        <Circle cx="12" cy="12" r="1.5" stroke={stroke} strokeWidth={sw} fill="none" />
        <Circle cx="19" cy="12" r="1.5" stroke={stroke} strokeWidth={sw} fill="none" />
      </G>
    ),
    dollar: <Path d="M12 3v18M8 7h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" {...props} />,
    card: (
      <G {...props}>
        <Rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M3 10h18" />
      </G>
    ),
    arrow_right: <Path d="M5 12h14M13 6l6 6-6 6" {...props} />,
    arrow_left: <Path d="M19 12H5M11 18l-6-6 6-6" {...props} />,
    download: <Path d="M12 3v12M6 11l6 6 6-6M4 21h16" {...props} />,
    upload: <Path d="M12 21V9M6 13l6-6 6 6M4 3h16" {...props} />,
    eye: (
      <G {...props}>
        <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <Circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} fill="none" />
      </G>
    ),
    zap: <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...props} />,
    clock: (
      <G {...props}>
        <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M12 7v5l3 2" />
      </G>
    ),
    tag: (
      <G {...props}>
        <Path d="M3 12V3h9l9 9-9 9-9-9z" />
        <Circle cx="8" cy="8" r="1.5" stroke={stroke} strokeWidth={sw} fill="none" />
      </G>
    ),
    refresh: <Path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" {...props} />,
    wifi: <Path d="M2 8.5A15 15 0 0 1 22 8.5M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01" {...props} />,
    signal: <Path d="M3 21V9M9 21V5M15 21V3M21 21v-6" {...props} />,
    battery: (
      <G {...props}>
        <Rect x="2" y="7" width="18" height="10" rx="2" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M22 10v4" />
        <Rect x="4" y="9" width="12" height="6" fill={stroke} stroke="none" />
      </G>
    ),
    copy: (
      <G {...props}>
        <Rect x="8" y="8" width="12" height="12" rx="2" stroke={stroke} strokeWidth={sw} fill="none" />
        <Path d="M4 16V6a2 2 0 0 1 2-2h10" />
      </G>
    ),
    chart: <Path d="M3 21h18M6 18V10M11 18V6M16 18v-5M21 18V8" {...props} />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name]}
    </Svg>
  );
}
