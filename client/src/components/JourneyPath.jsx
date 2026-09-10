/** A winding river/trail line — echoes the path through the Tripnest mark. */
export default function JourneyPath() {
  return (
    <svg
      className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 text-sage/60 sm:w-32"
      viewBox="0 0 100 900"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M50 0 C15 90 85 160 50 260 C15 360 85 430 50 530 C15 630 85 700 50 800 C25 850 40 880 50 900"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="1 14"
        strokeLinecap="round"
      />
    </svg>
  );
}
