/* Original KeepNear illustrations: soft, rounded people in the brand palette.
   All drawn in a 200 × 200 box. Decorative, so hidden from screen readers. */

const INK = "#3E1B28";
const PLUM = "#5B2A3C";
const PEACH = "#F2A98B";
const CREAM = "#FFF4EA";
const BLUSH = "#FBE3D6";

type Hair = "short" | "long" | "bun" | "curly" | "afro" | "wavy";

function Face({ cx = 100, cy = 95 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <path d={`M${cx - 14} ${cy + 1} q5 5 10 0`} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 4} ${cy + 1} q5 5 10 0`} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M${cx - 8} ${cy + 13} q8 7 16 0`} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx={cx - 17} cy={cy + 11} r="5" fill={PEACH} opacity="0.65" />
      <circle cx={cx + 17} cy={cy + 11} r="5" fill={PEACH} opacity="0.65" />
    </g>
  );
}

function HairBack({ style, color }: { style: Hair; color: string }) {
  if (style === "long")
    return <path d="M64 98 C58 58 84 50 100 50 C118 50 144 60 136 100 L142 150 C120 158 80 158 58 150 Z" fill={color} />;
  if (style === "wavy")
    return <path d="M66 96 C60 58 86 52 100 52 C116 52 142 60 134 96 C142 112 132 124 138 138 C116 146 84 146 62 138 C68 124 58 112 66 96 Z" fill={color} />;
  if (style === "afro")
    return (
      <g fill={color}>
        <circle cx="100" cy="84" r="44" />
        <circle cx="64" cy="98" r="18" />
        <circle cx="136" cy="98" r="18" />
      </g>
    );
  if (style === "bun") return <circle cx="100" cy="56" r="14" fill={color} />;
  return null;
}

function HairFront({ style, color }: { style: Hair; color: string }) {
  switch (style) {
    case "short":
      return <path d="M69 92 C66 62 86 56 100 56 C120 56 136 66 131 92 C124 78 112 72 100 72 C86 72 76 78 69 92 Z" fill={color} />;
    case "bun":
      return <path d="M70 92 C68 66 86 62 100 62 C116 62 134 68 130 92 C124 80 114 76 100 76 C88 76 76 80 70 92 Z" fill={color} />;
    case "long":
    case "wavy":
      return <path d="M70 90 C70 64 88 58 102 58 C120 58 134 70 130 88 C118 82 108 72 104 66 C96 78 84 86 70 90 Z" fill={color} />;
    case "curly":
      return (
        <g fill={color}>
          <circle cx="78" cy="74" r="12" />
          <circle cx="92" cy="64" r="13" />
          <circle cx="108" cy="64" r="13" />
          <circle cx="122" cy="74" r="12" />
          <circle cx="70" cy="88" r="9" />
          <circle cx="130" cy="88" r="9" />
        </g>
      );
    default:
      return null;
  }
}

/** A person from the chest up. */
function Person({
  skin,
  hair,
  hairColor,
  top,
  x = 0,
  y = 0,
  s = 1,
  children,
}: {
  skin: string;
  hair: Hair;
  hairColor: string;
  top: string;
  x?: number;
  y?: number;
  s?: number;
  children?: React.ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <HairBack style={hair} color={hairColor} />
      <path d="M44 204 C44 160 68 136 100 136 C132 136 156 160 156 204 Z" fill={top} />
      <rect x="91" y="116" width="18" height="24" rx="8" fill={skin} />
      <circle cx="100" cy="95" r="30" fill={skin} />
      <HairFront style={hair} color={hairColor} />
      <Face />
      {children}
    </g>
  );
}

function Backdrop({ fill = BLUSH }: { fill?: string }) {
  return (
    <g>
      <circle cx="100" cy="108" r="86" fill={fill} />
      <path d="M30 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={PEACH} />
      <path d="M170 150 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill={PEACH} />
    </g>
  );
}

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="kn-circle">
          <rect x="0" y="0" width="200" height="200" />
        </clipPath>
      </defs>
      {children}
    </svg>
  );
}

/** Someone recording a message on their phone. */
export function RecordingScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <Person skin="#8D5524" hair="short" hairColor="#2B1B17" top={PLUM} x={-14} />
      <path d="M118 176 C128 168 134 160 140 150" stroke="#8D5524" strokeWidth="14" fill="none" strokeLinecap="round" />
      <rect x="132" y="96" width="40" height="66" rx="8" fill={INK} />
      <rect x="136" y="102" width="32" height="52" rx="4" fill={CREAM} />
      <circle cx="152" cy="146" r="4" fill="#E0533D" className="kn-pulse" />
      <circle cx="152" cy="122" r="9" fill={PEACH} />
      <path d="M152 116 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8" fill={PLUM} />
    </Svg>
  );
}

/** A bride watching a message on her wedding day. */
export function WeddingScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <path d="M58 70 C70 40 130 40 142 70 L160 170 C120 182 80 182 40 170 Z" fill="#FFFFFF" opacity="0.85" />
      <Person skin="#E0AC69" hair="long" hairColor="#4A2F27" top="#FFFFFF">
        <path d="M70 140 C84 150 116 150 130 140" stroke={BLUSH} strokeWidth="4" fill="none" />
        <circle cx="100" cy="64" r="5" fill={PEACH} />
        <circle cx="90" cy="66" r="4" fill="#FFFFFF" />
        <circle cx="110" cy="66" r="4" fill="#FFFFFF" />
      </Person>
      <path d="M152 46 c-6 -8 -18 -2 -12 8 l12 12 12 -12 c6 -10 -6 -16 -12 -8z" fill={PEACH} className="kn-float-sm" />
    </Svg>
  );
}

/** A grandmother sharing a handwritten recipe. */
export function GrandparentScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <Person skin="#F1C27D" hair="bun" hairColor="#C9C3C0" top={PEACH}>
        <circle cx="91" cy="97" r="9" fill="none" stroke={INK} strokeWidth="2.5" />
        <circle cx="109" cy="97" r="9" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M100 97 h0" stroke={INK} strokeWidth="2.5" />
        <path d="M80 150 L100 168 L120 150" stroke={CREAM} strokeWidth="5" fill="none" />
      </Person>
      <g transform="rotate(-8 60 168)">
        <rect x="30" y="140" width="62" height="46" rx="6" fill={CREAM} stroke={PLUM} strokeWidth="2" />
        <path d="M40 154 h40 M40 164 h32 M40 174 h36" stroke={PLUM} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </g>
    </Svg>
  );
}

/** A parent holding their newborn. */
export function NewParentScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <Person skin="#C68642" hair="curly" hairColor="#2B1B17" top="#7A3E52" />
      <ellipse cx="100" cy="172" rx="40" ry="22" fill={CREAM} />
      <circle cx="78" cy="164" r="15" fill="#D9A066" />
      <path d="M72 164 q3 3 6 0 M82 164 q3 3 6 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M66 156 C70 146 86 146 90 156 C84 152 72 152 66 156 Z" fill={PEACH} />
      <path d="M58 176 C80 194 124 194 142 176" stroke="#C68642" strokeWidth="12" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Two partners side by side. */
export function PartnersScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <Person skin="#F1C27D" hair="wavy" hairColor="#B5651D" top={PEACH} x={-18} y={14} s={0.82} />
      <Person skin="#5C3A21" hair="short" hairColor="#1A0F0C" top={PLUM} x={52} y={8} s={0.86} />
      <path d="M100 40 c-6 -8 -18 -2 -12 8 l12 12 12 -12 c6 -10 -6 -16 -12 -8z" fill={PEACH} className="kn-float-sm" />
    </Svg>
  );
}

/** A young person graduating: one of the big days a message can be saved for. */
export function MilestoneScene({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <Backdrop />
      <Person skin="#5C3A21" hair="afro" hairColor="#1A0F0C" top="#2E4A62">
        <path d="M62 54 L100 40 L138 54 L100 68 Z" fill={INK} />
        <rect x="84" y="56" width="32" height="12" rx="3" fill={INK} />
        <path d="M134 56 v18" stroke={PEACH} strokeWidth="3" />
        <circle cx="134" cy="76" r="4" fill={PEACH} />
      </Person>
    </Svg>
  );
}

/** A sealed envelope with the heart-lock. */
export function SealedEnvelope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" focusable="false">
      <rect x="6" y="10" width="108" height="72" rx="10" fill={CREAM} stroke={PLUM} strokeWidth="3" />
      <path d="M8 16 L60 52 L112 16" fill="none" stroke={PLUM} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="60" cy="52" r="15" fill={PEACH} />
      <path d="M60 60 c-6 -3 -8 -6 -6 -9 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c2 3 0 6 -6 9z" fill={PLUM} />
    </svg>
  );
}
