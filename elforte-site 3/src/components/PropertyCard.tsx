import { Link } from "react-router-dom";
import type { Property } from "../data/properties";

export default function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const soldOut = property.status === "closed";

  return (
    <article className="flex flex-col">
      <Link
        to={`/properties/${property.slug}`}
        className="relative block overflow-hidden rounded-lg bg-[#9db4c4]"
        aria-label={`View ${property.name}`}
      >
        <img
          src={property.image}
          alt={property.name}
          className={`aspect-[437/412] h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.03] ${
            soldOut ? "grayscale" : ""
          }`}
          loading="lazy"
        />
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09123c]/45">
            <span className="rounded-full bg-white px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#09123c]">
              Sold out
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center gap-3">
          <Link to={`/properties/${property.slug}`} className="hover:text-[#cc091b]">
            <h3 className="text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#09123c]">
              {property.name}
            </h3>
          </Link>
          {soldOut && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-[#cc091b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              Sold out
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#6b8aa0]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span>{property.location}</span>
        </div>

        {compact ? null : (
          <p className="mt-3 flex-1 text-[14px] leading-[1.6] text-[#4a556a]">
            {property.description}
          </p>
        )}

        <div className="mt-4">
          {soldOut ? (
            <span className="inline-flex cursor-not-allowed items-center rounded-full border border-[#b5cfe0] bg-transparent px-4 py-1.5 text-[12.5px] font-semibold text-[#09123c] opacity-60">
              Sold out
            </span>
          ) : (
            <Link
              to={`/properties/${property.slug}`}
              className="inline-flex items-center rounded-full border border-[#b5cfe0] bg-transparent px-4 py-1.5 text-[12.5px] font-semibold text-[#09123c] transition-all duration-200 hover:border-[#09123c] hover:shadow-sm"
            >
              View property
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
