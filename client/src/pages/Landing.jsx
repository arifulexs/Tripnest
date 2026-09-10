import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import HeroArt from "../components/HeroArt.jsx";
import JourneyPath from "../components/JourneyPath.jsx";
import {
  IconMapPin,
  IconCompass,
  IconCalendar,
  IconPeople,
  IconWallet,
  IconHeart,
} from "../components/Icons.jsx";

const WAYPOINTS = [
  {
    icon: IconCompass,
    title: "Sketch the shape of it",
    body: "Name the trip, pick your dates, say who's coming. Tripnest turns that into a home base for everything else.",
  },
  {
    icon: IconCalendar,
    title: "Lay out the days",
    body: "Morning, afternoon, evening, night — drop in places, meals, and free time, then drag to rearrange when plans change.",
  },
  {
    icon: IconMapPin,
    title: "Pin it to the map",
    body: "Every saved place shows up on one interactive map, with the route and travel time between stops.",
  },
  {
    icon: IconWallet,
    title: "Watch the number",
    body: "Log flights, stays, meals, and tickets against a real budget, split per person, in whatever currency you're spending.",
  },
  {
    icon: IconPeople,
    title: "Bring people along",
    body: "Share an invite link. Everyone can edit the itinerary, add expenses, vote on where to eat, and chat without switching apps.",
  },
  {
    icon: IconHeart,
    title: "Look back on it",
    body: "When the trip wraps, Tripnest quietly totals the distance, the places, the spend — a small recap worth keeping.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Tripnest" className="h-9 w-9 object-contain" />
            <span className="font-display text-xl font-semibold text-ink">Tripnest</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden text-sm font-medium text-ink hover:text-forest sm:inline">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Start planning
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-16">
        <div>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl lg:text-[3.4rem]">
            The trip lives in your head. Tripnest gives it a place to live on paper.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-inksoft">
            One place to build the itinerary, drop pins on the map, track the budget, and get everyone
            travelling with you on the same page — before you've even left home.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary">
              Plan your first trip
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-inksoft">Free to use. No credit card, no app store required.</p>
        </div>
        <HeroArt />
      </section>

      {/* Journey / how it works */}
      <section id="how-it-works" className="border-t border-ink/10 bg-paper/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Planning a trip is its own kind of journey
            </h2>
            <p className="mt-3 text-inksoft">Here's how it unfolds inside Tripnest, start to finish.</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-3xl">
            <JourneyPath />
            <ol className="relative space-y-14">
              {WAYPOINTS.map((wp, i) => {
                const fromLeft = i % 2 === 0;
                return (
                  <li
                    key={wp.title}
                    className={`relative flex flex-col items-center gap-4 sm:flex-row ${
                      fromLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    <div className={`w-full sm:w-1/2 ${fromLeft ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                      <h3 className="font-display text-xl font-semibold text-ink">{wp.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{wp.body}</p>
                    </div>
                    <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cream bg-ink text-cream shadow-soft">
                      <wp.icon className="h-5 w-5" />
                    </div>
                    <div className="hidden w-1/2 sm:block" />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
            Your next trip is still just an idea. Let's give it a shape.
          </h2>
          <div className="mt-7">
            <Link to="/signup" className="btn-sun">
              Create your first trip
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 object-contain" />
            <span className="font-display text-lg font-semibold text-ink">Tripnest</span>
          </div>
          <p className="text-xs uppercase tracking-wide text-inksoft">Plan · Explore · Make memories</p>
          <p className="mt-2 text-xs text-inksoft">© {new Date().getFullYear()} Tripnest.</p>
        </div>
      </footer>
    </div>
  );
}
