import { IconMapPin } from "./Icons.jsx";

export default function HeroArt() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md sm:max-w-lg lg:max-w-none">
      <svg viewBox="0 0 480 560" className="h-full w-full" aria-hidden="true">
        <circle cx="150" cy="120" r="58" fill="#F0A868" opacity="0.9" />
        <path
          d="M40 340 L170 160 L245 250 L300 190 L440 340 Z"
          fill="#1B4332"
        />
        <path
          d="M230 340 L300 190 L440 340 Z"
          fill="#74A892"
        />
        <path
          d="M40 340 C 120 300, 160 300, 190 260 C 220 300, 260 300, 320 330 C 370 355, 410 345, 440 340 L440 420 L40 420 Z"
          fill="#F8F5EC"
        />
        <path
          d="M60 415 C130 380 160 400 190 370 C220 400 270 385 330 400 C375 412 410 400 440 405"
          stroke="#1B4332"
          strokeWidth="3"
          strokeDasharray="1 10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M330 90 C345 75 365 72 380 80 C390 68 408 66 418 76"
          stroke="#1B4332"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="absolute -left-2 top-8 w-48 rotate-[-4deg] rounded-2xl border border-ink/10 bg-paper p-3 shadow-soft sm:w-56">
        <p className="text-[11px] font-medium text-inksoft">Day 2 · Kyoto</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-ink">
            <IconMapPin className="h-3.5 w-3.5 text-forest" />
            <span>8:00 — Fushimi Inari</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink">
            <IconMapPin className="h-3.5 w-3.5 text-sun" />
            <span>13:00 — Nishiki Market</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-0 w-40 rotate-[3deg] rounded-2xl border border-ink/10 bg-paper p-3 shadow-soft sm:w-48">
        <p className="text-[11px] font-medium text-inksoft">Trip budget</p>
        <p className="mt-1 font-display text-lg font-semibold text-ink">$1,240 <span className="text-xs font-body font-normal text-inksoft">/ $2,000</span></p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
          <div className="h-full w-[62%] rounded-full bg-forest" />
        </div>
      </div>
    </div>
  );
}
