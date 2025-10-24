// client/src/components/PillNav.jsx - CORRECTED VERSION

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // GSAP animation setup - no changes needed here
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    tlRefs.current[i]?.tweenTo(tlRefs.current[i].duration(), { duration: 0.3, ease });
  };

  const handleLeave = i => {
    tlRefs.current[i]?.tweenTo(0, { duration: 0.2, ease });
  };

  // --- Renders a button for items with an onClick function, and a Link for others ---
  const renderNavItem = (item, i) => {
    const commonProps = {
      className: `pill${activeHref === item.href ? ' is-active' : ''}`,
      onMouseEnter: () => handleEnter(i),
      onMouseLeave: () => handleLeave(i),
    };

    if (item.onClick) {
      return (
        <button {...commonProps} onClick={item.onClick} role="menuitem">
          <span className="label-stack">
            <span className="pill-label">{item.label}</span>
          </span>
        </button>
      );
    }

    return (
      <Link {...commonProps} to={item.href} role="menuitem">
        <span className="label-stack">
          <span className="pill-label">{item.label}</span>
        </span>
      </Link>
    );
  };

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor
  };

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav className="pill-nav" aria-label="Primary" style={cssVars}>
        {logo && <Link className="pill-logo" to={items[0]?.href || '/'} ref={logoRef}><img src={logo} alt={logoAlt} ref={logoImgRef} /></Link>}
        <div className="pill-nav-items desktop-only">
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.label || `item-${i}`} role="none">
                {renderNavItem(item, i)}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;