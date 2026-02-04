export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pulse" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#2bf2b4" />
          <stop offset="100%" stopColor="#7aa2f7" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" stroke="url(#pulse)" strokeWidth="3" />
      <circle cx="32" cy="32" r="19" stroke="rgba(122,162,247,0.5)" strokeWidth="2" />
      <path
        d="M14 34h10l4-10 6 20 5-12 4 6h11"
        stroke="url(#pulse)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="3" fill="#2bf2b4" />
    </svg>
  );
}
