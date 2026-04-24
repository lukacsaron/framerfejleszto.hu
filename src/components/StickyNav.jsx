import { useState, useEffect } from 'react';
import { Arrow } from './Icons';
import { FFButton, FFLogoMark } from './Primitives';

const NAV_LINKS = [
  { label: 'Probléma', href: '#problem' },
  { label: 'Folyamat', href: '#process' },
  { label: 'Framer', href: '#benefits' },
  { label: 'Munkáink', href: '#works' },
  { label: 'GYIK', href: '#faq' },
];

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Sticky bar */}
      <div className={`ff-sticky-bar ${scrolled ? 'visible' : ''}`}>
        <div className="ff-sticky-inner">
          <a href="#" className="ff-sticky-logo">
            <FFLogoMark size={22} />
          </a>
          <button
            className="ff-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect y="0" width="20" height="2" rx="1" fill="#fff" />
              <rect y="6" width="20" height="2" rx="1" fill="#fff" />
              <rect y="12" width="20" height="2" rx="1" fill="#fff" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar overlay */}
      {open && (
        <div className="ff-sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div className={`ff-sidebar ${open ? 'open' : ''}`}>
        <div className="ff-sidebar-header">
          <a href="#" className="ff-sticky-logo" onClick={() => setOpen(false)}>
            <FFLogoMark size={22} />
          </a>
          <button
            className="ff-sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l14 14M16 2L2 16" />
            </svg>
          </button>
        </div>
        <nav className="ff-sidebar-links">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              className="ff-sidebar-link"
              href={href}
              data-cursor="link"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="ff-sidebar-cta">
          <FFButton variant="dark" icon={<Arrow />} onClick={() => setOpen(false)}>
            Pitchelj minket
          </FFButton>
        </div>
      </div>
    </>
  );
}
