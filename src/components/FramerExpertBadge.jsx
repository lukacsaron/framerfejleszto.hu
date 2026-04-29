import './FramerExpertBadge.css';

/**
 * Standalone "Framer Expert" badge.
 * Replaces the unframer-generated component to drop the ~3.2 MB Framer runtime.
 *
 * Visual reference: black pill, 7px radius, 1px rgba(255,255,255,0.2) border,
 * 7px gap between an 8x12 white Framer logo and "Framer Expert" text in
 * Inter (12px / weight ~650 / -0.01em letter-spacing).
 *
 * @param {{ link: string }} props
 */
export default function FramerExpertBadge({ link }) {
  return (
    <a
      className="ff-framer-expert-badge"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Official Framer Expert"
    >
      <svg
        className="ff-framer-expert-badge__logo"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 8 12"
        width="8"
        height="12"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M 8 0 L 8 4 L 4 4 L 0 0 Z" fill="currentColor" />
        <path d="M 0 4 L 4 4 L 8 8 L 0 8 Z" fill="currentColor" />
        <path d="M 0 8 L 4 8 L 4 12 Z" fill="currentColor" />
      </svg>
      <span className="ff-framer-expert-badge__label">Framer Expert</span>
    </a>
  );
}
