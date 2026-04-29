import { useState, useCallback } from 'react';
import { Arrow } from './Icons';
import MagneticButton from './animations/MagneticButton';

export function FFLogoMark({ size = 28, className = '' }) {
  const w = (248 / 124) * size;
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={size} viewBox="0 0 248 124" fill="currentColor">
      <path d="M148.656 62.963C110.535 89.647 103.715 96.014 103.715 124h91.286V93.63l-46.292 3.184c2.323-3.43 7.037-6.807 14.721-12.233 9.12-6.442 19.036-13.162 25.201-20.556 5.078-6.077 7.936-13.93 7.936-23.077 0-23.517-17.406-39.69-43.693-39.69-14.275 0-26.282 4.335-34.882 12.674C109.85 21.7 106.696 31.638 106 45.12l28.957 2.176c.444-5.216.649-7.203 2.884-11.146 2.714-4.794 8.38-7.345 13.091-7.345 9.053 0 14.21 5.787 13.649 14.428-.411 6.321-4.723 11.725-15.925 19.729Zm-103.712 0C6.817 89.647 0 96.01 0 124h91.287V93.63l-46.293 3.184c2.324-3.43 7.035-6.807 14.718-12.233 9.123-6.442 19.045-13.162 25.21-20.556 5.072-6.077 7.933-13.93 7.933-23.077 0-23.517-17.408-39.69-43.69-39.69-14.277 0-26.285 4.335-34.885 12.674C6.13 21.7 2.981 31.64 2.282 45.124L31.245 47.3c.435-5.216.647-7.203 2.879-11.146 2.714-4.794 8.383-7.345 13.088-7.345 9.052 0 14.216 5.787 13.652 14.428-.409 6.318-4.726 11.722-15.92 19.726ZM247.638 19.67h-39.846v-8.242l19.085-3.688h-19.085V0h39.846v7.831l-19.923 4.007h19.923v7.831ZM248 35.635c0 5.722-4.075 8.583-12.226 8.583h-17.183c-7.441 0-11.162-3.279-11.162-9.835 0-2.701.544-4.773 1.63-6.215 1.072-1.442 2.642-2.436 4.709-2.982 2.068-.546 4.589-.82 7.562-.82v7.832h-3.532c-.86 0-1.577.121-2.15.364-.589.227-.883.713-.883 1.457 0 .926.309 1.54.928 1.844a4.764 4.764 0 0 0 2.037.432h19.312c1.072 0 1.947-.136 2.626-.41.665-.288.997-.842.997-1.661 0-.85-.332-1.412-.997-1.685-.679-.288-1.569-.433-2.671-.433h-5.683v2.14h-6.882v-9.789h23.206v3.21l-3.351 1.366C246.762 30.43 248 32.63 248 35.635Zm-.362 20.857h-39.846v-7.74h39.846v7.74ZM248 70.705c0 3.657-.906 6.298-2.717 7.922-1.811 1.609-4.694 2.413-8.648 2.413h-3.894v-7.922h4.98c.921 0 1.646-.137 2.174-.41.513-.288.77-.781.77-1.48 0-.728-.212-1.229-.634-1.502-.423-.288-1.117-.433-2.083-.433-1.223 0-2.241.122-3.057.365-.83.242-1.615.667-2.354 1.275-.755.591-1.63 1.418-2.626 2.48l-3.396 3.598c-2.521 2.686-5.404 4.03-8.649 4.03-3.396 0-5.984-.79-7.765-2.368-1.781-1.594-2.672-3.893-2.672-6.898 0-3.673.974-6.276 2.921-7.809 1.947-1.548 4.905-2.322 8.875-2.322v8.15h-2.74c-.543 0-.966.16-1.268.478-.301.304-.452.721-.452 1.252 0 .638.181 1.108.543 1.412.347.288.8.432 1.358.432.559 0 1.163-.151 1.812-.455.649-.303 1.396-.903 2.241-1.798l4.415-4.622a25.928 25.928 0 0 1 2.784-2.55c.966-.774 2.098-1.396 3.396-1.866 1.283-.47 2.853-.706 4.709-.706 3.744 0 6.679.698 8.807 2.094 2.113 1.382 3.17 3.795 3.17 7.24Zm-.362 29.954h-39.846V84.632h7.697v7.877h7.766v-7.558h7.493v7.558h9.124v-8.4h7.766v16.55Zm0 23.341h-39.846v-11.018c0-2.884.799-5.054 2.399-6.511 1.585-1.457 3.91-2.186 6.973-2.186h18.656c3.773 0 6.686.668 8.739 2.003 2.052 1.321 3.079 3.643 3.079 6.967V124Zm-7.041-8.059v-1.389c0-1.472-.71-2.208-2.128-2.208h-20.557c-1.329 0-2.181.182-2.559.546-.392.35-.588 1.07-.588 2.163v.888h25.832Z" />
    </svg>
  );
}

export function FFLogo({ onDark = false }) {
  return (
    <a href="#" className="ff-logo" style={{ color: onDark ? '#fff' : 'var(--c-midnight-950)' }}>
      <FFLogoMark size={28} />
    </a>
  );
}

export function FFButton({ variant = 'orange', children, icon, onClick, magnetic = true, ...rest }) {
  const btn = (
    <button className={`ff-btn ${variant}`} onClick={onClick} data-cursor="link" {...rest}>
      <span>{children}</span>
      <span className="ic">{icon || <Arrow />}</span>
    </button>
  )
  return magnetic ? <MagneticButton>{btn}</MagneticButton> : btn
}

export function FFNav({ onDark = true }) {
  return (
    <nav className={`ff-nav ${onDark ? 'on-dark' : 'on-light'}`}>
      <FFLogo onDark={onDark} />
      <div className="ff-nav-links">
        <a className="ff-nav-link" href="#problem">Probléma</a>
        <a className="ff-nav-link" href="#process">Folyamat</a>
        <a className="ff-nav-link" href="#benefits">Framer</a>
        <a className="ff-nav-link" href="#works">Munkáink</a>
        <a className="ff-nav-link" href="#faq">GYIK</a>
      </div>
      <div className="ff-nav-cta">
        <FFButton variant={onDark ? 'white' : 'dark'} icon={<Arrow />}>Pitchelj minket</FFButton>
      </div>
    </nav>
  );
}

export function FFStamp({ className = '', spin = true, size = 140 }) {
  const [fast, setFast] = useState(false)
  const [clicking, setClicking] = useState(false)

  const onClick = useCallback(() => {
    setClicking(true)
    setTimeout(() => setClicking(false), 400)
  }, [])

  return (
    <div
      className={`ff-stamp ${className} ${fast ? 'ff-stamp-fast' : ''} ${clicking ? 'ff-stamp-click' : ''}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setFast(true)}
      onMouseLeave={() => setFast(false)}
      onClick={onClick}
    >
      <img className={`ff-stamp-ring ${spin ? 'spinning' : ''}`} src="/assets/22-ring.avif" alt="" />
      <img className="ff-stamp-logo" src="/assets/22-number.png" alt="22" />
    </div>
  )
}

