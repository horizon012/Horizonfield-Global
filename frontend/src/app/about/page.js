import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../components/layout/SiteHeader";
import styles from "./about.module.css";

export const metadata = {
  title: "About Us | Horizonfield Global",
  description:
    "Learn about Horizonfield Global's international trading and sourcing operations in India and Dubai, our business divisions, and our India-based businesses.",
};

const divisions = [
  {
    number: "01",
    tag: "AGRICULTURAL COMMODITIES",
    title: "Quality from the source.",
    description:
      "Rice, grains, wheat, flour and selected agricultural products, sourced with care for domestic and international requirements.",
    image: "/images/hero/hero-agriculture.webp",
    alt: "Golden harvest and assorted grains ready for trade",
  },
  {
    number: "02",
    tag: "BUILDING MATERIALS",
    title: "Materials that move projects forward.",
    description:
      "Construction and scaffolding supplies, including tie rods, ledger components, couplers and formwork accessories.",
    image: "/images/hero/hero-construction.webp",
    alt: "Construction site with steel formwork and scaffolding materials",
  },
  {
    number: "03",
    tag: "TECHNOLOGY DISTRIBUTION",
    title: "Connecting products with markets.",
    description:
      "Distribution-led technology operations with retail-store activities, connecting customers and business partners to technology products.",
    image: null,
    alt: null,
  },
];

const principles = [
  { number: "01", title: "Purposeful sourcing", description: "Understanding product requirements and identifying suitable supply opportunities." },
  { number: "02", title: "Clear communication", description: "Keeping commercial discussions transparent and practical from enquiry to delivery." },
  { number: "03", title: "Quality focus", description: "Prioritizing product suitability, specifications and dependable supplier relationships." },
  { number: "04", title: "Long-term thinking", description: "Building business connections designed to grow beyond a single transaction." },
];

export default function AboutPage() {
  return (
    <>
      {/* The existing homepage renders the header itself, so this page follows the same pattern. */}
      <SiteHeader />

      <main className={styles.page}>
        {/* 01 — Page hero */}
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroText}>
                <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> ABOUT HORIZONFIELD GLOBAL</p>
                <h1 id="about-title" className={styles.heroTitle}>
                  Connecting markets.<br />
                  <span>Building confidence.</span>
                </h1>
                <p className={styles.heroDescription}>
                  Horizonfield Global Private Limited is an international trading and sourcing business
                  primarily operating from <strong>India and Dubai</strong>. We connect products, markets and
                  partners across multiple business sectors.
                </p>
                <div className={styles.heroActions}>
                  <Link href="/products" className={styles.primaryButton}>
                    Explore Our Products <span aria-hidden="true">↗</span>
                  </Link>
                  <Link href="/enquiry" className={styles.outlineButton}>
                    Make an Enquiry <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className={styles.locationLine}>
                  <span className={styles.locationDot} />
                  <span>Our primary operating markets</span>
                  <strong>INDIA</strong>
                  <span className={styles.locationSeparator} aria-hidden="true" />
                  <strong>DUBAI</strong>
                </div>
              </div>

              <div className={styles.heroVisual}>
                <Image
                  src="/images/hero/hero-partnership.webp"
                  alt="International business partnership with trade and construction in the background"
                  fill
                  priority
                  sizes="(max-width: 850px) 100vw, 49vw"
                  className={styles.heroImage}
                />
                <div className={styles.heroImageShade} aria-hidden="true" />
                <div className={styles.visualGlass}>
                  <span className={styles.visualGlassMark} aria-hidden="true">✦</span>
                  <div>
                    <strong>Built around relationships</strong>
                    <span>Trading • Sourcing • Distribution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — Company story */}
        <section className={styles.story} aria-labelledby="who-we-are">
          <div className={styles.container}>
            <div className={styles.storyGrid}>
              <div>
                <p className={styles.sectionKicker}>WHO WE ARE</p>
                <h2 id="who-we-are" className={styles.sectionTitle}>A trading partner with a <em>broader perspective.</em></h2>
              </div>
              <div className={styles.storyBody}>
                <p>
                  Our work brings together agricultural commodities, construction materials and technology
                  distribution under one business vision: connecting the right products with the right opportunities.
                </p>
                <p>
                  With our primary operations spanning India and Dubai, we focus on sourcing, commercial
                  coordination and practical business relationships. Our approach is shaped by product knowledge,
                  responsive communication and an emphasis on long-term partnerships.
                </p>
                <Link className={styles.textLink} href="/contact">
                  Connect with our team <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 03 — Trading divisions */}
        <section className={styles.focus} aria-labelledby="trading-focus">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <p className={styles.sectionKicker}>OUR TRADING FOCUS</p>
                <h2 id="trading-focus" className={styles.sectionTitle}>Different sectors.<br /><em>One commitment.</em></h2>
              </div>
              <p className={styles.sectionAside}>Our business activities bring together complementary product categories and distinct customer needs.</p>
            </div>
            <div className={styles.divisionGrid}>
              {divisions.map((item) => (
                <article className={styles.divisionCard} key={item.number}>
                  <div className={`${styles.divisionVisual} ${!item.image ? styles.technologyVisual : ""}`}>
                    {item.image ? (
                      <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" className={styles.divisionImage} />
                    ) : (
                      <div className={styles.technologyEmblem} aria-hidden="true">
                        <svg viewBox="0 0 120 120" fill="none">
                          <rect x="25" y="25" width="70" height="70" rx="16" stroke="currentColor" strokeWidth="3" />
                          <rect x="40" y="40" width="40" height="40" rx="8" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="2" />
                          <path d="M45 12V25M60 12V25M75 12V25M45 95V108M60 95V108M75 95V108M12 45H25M12 60H25M12 75H25M95 45H108M95 60H108M95 75H108" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          <path d="M48 60H72M60 48V72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <span className={styles.divisionNumber}>{item.number}</span>
                  </div>
                  <div className={styles.divisionBody}>
                    <p className={styles.divisionTag}>{item.tag}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — Operating footprint */}
        <section className={styles.footprint} aria-labelledby="where-we-operate">
          <div className={styles.container}>
            <div className={styles.footprintGrid}>
              <div className={styles.footprintIntro}>
                <p className={styles.sectionKickerLight}>OUR OPERATING FOOTPRINT</p>
                <h2 id="where-we-operate">Rooted in India.<br /><span>Connected through Dubai.</span></h2>
                <p>Horizonfield Global primarily operates from India and Dubai, working across trading, sourcing and business development activities.</p>
              </div>
              <div className={styles.marketGrid}>
                <div className={styles.marketCard}>
                  <span className={styles.marketIndex}>01 / PRIMARY MARKET</span>
                  <strong>India</strong>
                  <p>Business operations and sourcing connections across our trading activities.</p>
                </div>
                <div className={styles.marketCard}>
                  <span className={styles.marketIndex}>02 / PRIMARY MARKET</span>
                  <strong>Dubai</strong>
                  <p>An important base for international trade relationships and market connectivity.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Values, expressed as intentions rather than unverified metrics */}
        <section className={styles.principles} aria-labelledby="our-approach">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <p className={styles.sectionKicker}>HOW WE WORK</p>
                <h2 id="our-approach" className={styles.sectionTitle}>A practical approach to <em>lasting partnerships.</em></h2>
              </div>
            </div>
            <div className={styles.principlesGrid}>
              {principles.map((item) => (
                <article className={styles.principleCard} key={item.number}>
                  <span className={styles.principleNumber}>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 06 — The group’s OTHER India-based businesses */}
        <section className={styles.ventures} aria-labelledby="other-businesses">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <p className={styles.sectionKicker}>BEYOND TRADING</p>
                <h2 id="other-businesses" className={styles.sectionTitle}>Explore our <em>other businesses.</em></h2>
              </div>
              <p className={styles.sectionAside}>
                Alongside our India–Dubai trading operations, we also have distinct businesses based in India.
              </p>
            </div>
            <div className={styles.ventureGrid}>
              <article className={`${styles.ventureCard} ${styles.harvestCard}`}>
                <span className={styles.ventureCountry}>INDIA-BASED BUSINESS</span>
                <div className={styles.ventureSymbol} aria-hidden="true">✳</div>
                <div className={styles.ventureContent}>
                  <h3>Nector Harvest</h3>
                  <p>A dedicated food and everyday essentials business with its own brand identity and customer experience.</p>
                  <a href="https://nectorharvest.com/" target="_blank" rel="noopener noreferrer" className={styles.ventureLink}>
                    Explore business <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
              <article className={`${styles.ventureCard} ${styles.elementallCard}`}>
                <span className={styles.ventureCountry}>INDIA-BASED BUSINESS</span>
                <div className={styles.elementallSymbol} aria-hidden="true">
                  <span className={styles.elementallInner} />
                </div>
                <div className={styles.ventureContent}>
                  <h3>Elementall Core</h3>
                  <p>A separate business within our wider portfolio, with a dedicated website and specialized business focus.</p>
                  <a href="https://www.elementallcore.com/" target="_blank" rel="noopener noreferrer" className={styles.ventureLink}>
                    Explore business <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 07 — Inquiry CTA */}
        <section className={styles.cta} aria-labelledby="about-cta-title">
          <div className={styles.container}>
            <div className={styles.ctaInner}>
              <div>
                <p className={styles.sectionKickerLight}>LET’S CONNECT</p>
                <h2 id="about-cta-title">Business begins with<br /><span>a conversation.</span></h2>
                <p>Looking for products, sourcing support or a long-term trading relationship? We'd be glad to hear from you.</p>
              </div>
              <Link href="/enquiry" className={styles.ctaButton}>
                Send an Enquiry <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div>
              <strong>HORIZONFIELD GLOBAL</strong>
              <p>International trading & sourcing • India and Dubai</p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/">Home</Link>
              <Link href="/products">Our Products</Link>
              <Link href="/businesses">Our Businesses</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
