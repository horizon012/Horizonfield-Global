/**
 * Horizonfield Global logo — original inline-SVG interpretation of the supplied
 * raster artwork. The sun, wheat and field shapes are editable vector paths.
 * The photo-realistic metallic bevel in the reference is intentionally replaced
 * with flat vector gradients to remain sharp at any size.
 */
export default function HorizonfieldLogo({ className = '', compact = false }) {
  const gold = '#C89B35';
  return (
    <svg
      className={className}
      width={compact ? 185 : 272}
      height={compact ? 53 : 74}
      viewBox="0 0 355 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Horizonfield Global Private Limited"
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <linearGradient id="hfgField" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#177A54" />
          <stop offset="1" stopColor="#074532" />
        </linearGradient>
        <linearGradient id="hfgSun" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#F6D27B" />
          <stop offset="1" stopColor="#BC8623" />
        </linearGradient>
      </defs>
      <g transform="translate(4 2)">
        {/* Sun / radiant rays */}
        <path d="M41 14V4 M31 16L26 7 M51 16L56 7 M23 23L14 17 M59 23L68 17 M19 33L8 31 M63 33L75 31" stroke={gold} strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M21 39a20 20 0 0 1 40 0" fill="url(#hfgSun)" />
        {/* Terraced farmland */}
        <path d="M4 43Q24 30 42 43Q57 30 80 44" stroke="#B78A30" strokeWidth="2.7" fill="none" strokeLinecap="round"/>
        <path d="M3 50Q29 37 42 48Q64 36 82 48Q58 52 41 82Q27 58 3 50Z" fill="url(#hfgField)"/>
        <path d="M5 54Q26 43 39 53M81 52Q57 45 43 59" fill="none" stroke="#C9A447" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M15 58Q31 61 42 82Q51 60 69 55" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75"/>
        {/* Stylized wheat stems and kernels */}
        <path d="M25 83Q15 65 11 57M60 83Q70 66 73 57" stroke={gold} strokeWidth="2.1" fill="none"/>
        {Array.from({length: 5}, (_, i) => (
          <g key={i}>
            <ellipse cx={12 + i * 2.5} cy={58 + i * 5.1} rx="3.4" ry="6.2" fill={gold} transform={`rotate(-34 ${12 + i * 2.5} ${58 + i * 5.1})`} />
            <ellipse cx={72 - i * 2.5} cy={58 + i * 5.1} rx="3.4" ry="6.2" fill={gold} transform={`rotate(34 ${72 - i * 2.5} ${58 + i * 5.1})`} />
          </g>
        ))}
      </g>
      <g transform="translate(92 1)">
        <text x="0" y="39" fill="#124A35" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="30" letterSpacing="0.4">HORIZONFIELD</text>
        <text x="49" y="66" fill={gold} fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="24" letterSpacing="9">GLOBAL</text>
        <path d="M16 57H43M208 57H252" stroke={gold} strokeWidth="1.7" />
        <text x="58" y="82" fill="#124A35" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="8.3" letterSpacing="3.1">PRIVATE LIMITED</text>
        <text x="19" y="93" fill="#697D72" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.5" letterSpacing="1.2">BRANDS THAT ENRICH EVERYDAY LIVING</text>
      </g>
    </svg>
  );
}
