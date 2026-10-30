import SiteHeader from '../../components/layout/SiteHeader';
import VerifiedEnquiryForm from '../../components/forms/VerifiedEnquiryForm';
import styles from './enquiry.module.css';

export const metadata = {
  title: 'Business Enquiry | Horizonfield Global',
  description: 'Verified enquiries for agricultural commodities, building materials, and technology distribution. Contact Horizonfield Global in India and Dubai.',
};

export default function EnquiryPage() {
  return (
    <>
      {/* Follow the existing About page: header is rendered by the page, not the root layout. */}
      <SiteHeader />
      <main className={styles.page}>
        <div aria-hidden="true" className={styles.ambient}>
          <span className={styles.orbA}/><span className={styles.orbB}/>
          <span className={styles.orbC}/><span className={styles.grid}/>
          <span className={styles.orbitA}/><span className={styles.orbitB}/>
          <span className={styles.lightTrailA}/><span className={styles.lightTrailB}/>
        </div>
        <section className={styles.layout} aria-labelledby="enquiry-heading">
          <div className={styles.intro}>
            <span className={styles.kicker}><span/> HORIZONFIELD GLOBAL</span>
            <h1 id="enquiry-heading">Let's build<br/><em>what's next.</em></h1>
            <p className={styles.lead}>Tell us what your business needs. Our team works across India and Dubai to connect quality products with the right opportunities.</p>
            <div className={styles.focuses} aria-label="Our trading divisions">
              <div><b>01</b><span>Agricultural Commodities</span></div>
              <div><b>02</b><span>Building Materials</span></div>
              <div><b>03</b><span>Technology Distribution</span></div>
            </div>
            <p className={styles.contact}>Prefer email? <a href="mailto:support@horizonfieldglobal.com">support@horizonfieldglobal.com</a></p>
          </div>
          <div className={styles.formWrap}>
            <div className={styles.formHeading}>
              <span className={styles.formKicker}>BUSINESS ENQUIRY</span>
              <h2>Request a quotation</h2>
              <p>Complete the form and verify your email with a one-time code.</p>
            </div>
            <VerifiedEnquiryForm />
          </div>
        </section>
        <p className={styles.footerNote}>Horizonfield Global Private Limited · India & Dubai · Secure business enquiries</p>
      </main>
    </>
  );
}
