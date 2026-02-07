export default function LoadingSpinner() {
  return (
    <div className="spinner-wrapper">
      <svg viewBox="0 0 200 200" width="120" height="120">
        <defs>
          <linearGradient id="grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="#ff4ecd" />
            <stop offset="100%" stopColor="#47D6AD" />
          </linearGradient>
        </defs>

        <path
          d="M100 30
             C140 30 170 60 170 100
             C170 140 140 170 100 170
             C60 170 30 140 30 100
             C30 60 60 30 100 30"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}
