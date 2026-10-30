'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import styles from './SiteHeader.module.css';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Our Products', href: '/products' },
  { label: 'Enquiry', href: '/enquiry' },
  { label: 'Contact', href: '/contact' },
  { label: 'Our Businesses', href: '/businesses' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Horizonfield Global home" onClick={() => setMenuOpen(false)}>
          <Image
          src="/images/logo/horizonfield_logo_600x200.png"
          alt="Horizonfield Global Private Limited"
          width={600}
          height={200}
          priority
          className={styles.logoImage}
          />
        </Link>
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
        <nav id="main-navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ''}`} aria-label="Main navigation">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
