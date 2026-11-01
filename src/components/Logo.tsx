type Props = { size?: number; withWord?: boolean; light?: boolean };

export function LogoMark({ size = 36, light = false }: { size?: number; light?: boolean }) {
  const stroke = light ? "#FFF4EA" : "#5B2A3C";
  const hole = light ? "#5B2A3C" : "#FFF4EA";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M40 50 V36 a20 20 0 0 1 40 0 V50" fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
      <path
        d="M60 106 C 22 84, 14 62, 28 50 C 40 40, 54 44, 60 54 C 66 44, 80 40, 92 50 C 106 62, 98 84, 60 106 Z"
        fill="#F2A98B"
      />
      <circle cx="60" cy="68" r="7" fill={hole} />
      <rect x="57" y="70" width="6" height="16" rx="3" fill={hole} />
    </svg>
  );
}

export function Logo({ size = 36, withWord = true, light = false }: Props) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="KeepNear">
      <LogoMark size={size} light={light} />
      {withWord && (
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: size * 0.7, color: light ? "#FFF4EA" : "#5B2A3C" }}
        >
          keepnear
        </span>
      )}
    </span>
  );
}
