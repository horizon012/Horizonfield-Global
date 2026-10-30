'use client';

import { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import styles from './DiagonalHero.module.css';


/**
 * Keep your existing WebP images in frontend/public/images/hero/.
 * The first image is the construction image; agriculture and partnership follow.
 * Photos shuffle automatically through the three fixed diagonal panels.
 */
const SLIDES = [
  {
    id: 'construction',
    image: '/images/hero/hero-construction.webp',
    alt: 'Construction site with steel scaffolding, tie rods and cranes',
    eyebrow: 'BUILDING MATERIALS & GLOBAL SUPPLY',
    title: 'Building stronger',
    highlight: 'foundations.',
    description:
      'Dependable tie rods, scaffolding components and construction materials for projects around the world.',
    action: 'Explore Building Materials',
    href: '/products?category=building-materials',
    focus: '58% center',
  },
  {
    id: 'agriculture',
    image: '/images/hero/hero-agriculture.webp',
    alt: 'Golden rice fields with harvested rice, grains and turmeric',
    eyebrow: 'AGRICULTURAL COMMODITIES',
    title: 'From quality harvests',
    highlight: 'to global markets.',
    description:
      'Premium rice, grains, wheat and agricultural products, sourced for international markets.',
    action: 'Explore Agriculture',
    href: '/products?category=agriculture',
    focus: '62% center',
  },
  {
    id: 'partnership',
    image: '/images/hero/hero-partnership.webp',
    alt: 'Business handshake representing international trade and partnership',
    eyebrow: 'INTERNATIONAL TRADE & PARTNERSHIPS',
    title: 'Building trust.',
    highlight: 'Connecting businesses.',
    description:
      'Creating long-term trade relationships through reliable sourcing and business partnerships.',
    action: 'Explore Our Businesses',
    href: '/businesses',
    focus: '52% center',
  },
];

const ROTATE_EVERY_MS = 4000;

export default function DiagonalHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // A new timeout starts after every slide change, including manual navigation.
  // Do NOT pause on hover: that caused the previous desktop autoplay problem.
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, ROTATE_EVERY_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPlaying]);

  const goTo = (index) => setActiveIndex((index + SLIDES.length) % SLIDES.length);
  const previous = () => setActiveIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActiveIndex((current) => (current + 1) % SLIDES.length);
  const touchStartX = useRef(null);

const handleTouchStart = (event) => {
  touchStartX.current = event.touches[0].clientX;
};

const handleTouchEnd = (event) => {
  if (touchStartX.current === null) return;

  const distance =
    event.changedTouches[0].clientX - touchStartX.current;

  touchStartX.current = null;

  if (Math.abs(distance) < 50) return;

  if (distance < 0) {
    next();
  } else {
    previous();
  }
};

const handleHeroClick = (event) => {
  if (event.target.closest("a, button")) return;

  // Avoid triggering an additional slide after a swipe.
  if (event.detail === 0) return;

  const bounds = event.currentTarget.getBoundingClientRect();
  const position = event.clientX - bounds.left;

  if (position < bounds.width * 0.4) {
    previous();
  } else {
    next();
  }
};
  const activeSlide = SLIDES[activeIndex];
  

  return (
    <section
      className={styles.hero}
      aria-label="Horizonfield Global featured trading divisions"
      onClick={handleHeroClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
        >
      <div className={styles.panels} aria-hidden="true">
        {[0, 1, 2].map((slot) => {
          const shownSlideIndex = (activeIndex + slot) % SLIDES.length;
          return (
            <div
              key={slot}
              className={`${styles.panel} ${[styles.panelActive, styles.panelNext, styles.panelLast][slot]}`}
            >
              <div className={styles.panelMedia}>
                {SLIDES.map((slide, imageIndex) => (
                  <div
                    key={slide.id}
                    className={`${styles.imageLayer} ${shownSlideIndex === imageIndex ? styles.imageVisible : ''}`}
                  >
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      unoptimized
                      priority={imageIndex === 0 && slot === 0}
                      sizes={slot === 0 ? '(max-width: 760px) 100vw, 65vw' : '35vw'}
                      className={styles.panelImage}
                      style={{ objectPosition: slide.focus }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.imageShade} />
            </div>
          );
        })}
      </div>

      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.heroContent}>
        <div className={styles.copy} key={activeSlide.id}>
          <p className={styles.eyebrow}>
            <span className={styles.sparkle} aria-hidden="true" />
            {activeSlide.eyebrow}
          </p>
          <h1 className={styles.heading}>
            {activeSlide.title}
            <br />
            <span>{activeSlide.highlight}</span>
          </h1>
          <p className={styles.description}>{activeSlide.description}</p>
          <div className={styles.actions}>
            <Link href={activeSlide.href} className={styles.primaryButton}>
              {activeSlide.action} <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/enquiry" className={styles.secondaryButton}>
              Request a Quote <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`${styles.bottomBar} ${!isPlaying ? styles.isPaused : ''}`}>
        <div className={styles.slideSelector} role="group" aria-label="Choose a hero image">
          {SLIDES.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              aria-label={`Show ${slide.eyebrow.toLowerCase()}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className={`${styles.slideDot} ${index === activeIndex ? styles.slideDotActive : ''}`}
            >
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  );
}
