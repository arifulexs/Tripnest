const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconCompass(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-4 1.5L11 9l4-.5Z" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconPeople(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="9" cy="8.5" r="2.8" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9.5" r="2.2" />
      <path d="M15.2 14.3c2.4.2 4.3 2 4.3 4.7" />
    </svg>
  );
}

export function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M14 12.2h3.2" />
      <path d="M4 9.5h16" />
    </svg>
  );
}

export function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 20s-7.2-4.6-9.4-9A5 5 0 0 1 12 6a5 5 0 0 1 9.4 5c-2.2 4.4-9.4 9-9.4 9Z" />
    </svg>
  );
}

export function IconSuitcase(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="8" width="17" height="11" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2" />
      <path d="M3.5 13h17" />
    </svg>
  );
}

export function IconPlane(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M11 3.5 12.5 9l6 3-6 .5-1.5 7-1.5-6-6-1 5-2Z" />
    </svg>
  );
}

export function IconBird(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M2 12c2.5-2.5 5-1 6.5 0-1-2 0-4.5 2-5.5-1 2 .5 4 2 4 2-1 4.5-1 6.5 1.5-2-.5-4 0-5 1 2 .5 4.5 2 5 4-2.5-1.5-5-2-7-1.5-3 .8-6.5 0-10-3.5Z" />
    </svg>
  );
}
