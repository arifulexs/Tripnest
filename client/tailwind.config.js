/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B4332",      // deep pine — headings, nav, primary buttons
        forest: "#2D6A4F",   // mid green — secondary elements
        sage: "#74A892",     // soft green — tags, borders, muted accents
        mist: "#D8E6DD",     // pale green wash — section backgrounds
        sun: "#F0A868",      // warm gold — CTAs, highlights (from the logo sun)
        sunlight: "#FBEBD8", // pale gold wash
        cream: "#F8F5EC",    // page background (matches logo)
        paper: "#FFFFFF",
        inksoft: "#5B6E64",  // muted body text
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        trip: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(27, 67, 50, 0.18)",
      },
    },
  },
  plugins: [],
};
