'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { COUNTRY_DIAL_CODES, ENQUIRY_CATEGORIES, ENQUIRY_PRODUCTS } from '../../data/enquiryCatalog';
import styles from './VerifiedEnquiryForm.module.css';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const INITIAL = {
  name: '', company_name: '', company_website: '', email: '', country_iso: 'IN',
  whatsapp_number: '', category: '', product: '', other_product: '',
  quantity: '', destination: '', message: '', fax_field: '', consent: false,
};

const NEEDS_CUSTOM = (product) => product.startsWith('Other ');

async function postJSON(path, data) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), signal: controller.signal, cache: 'no-store',
    });
    let payload = {};
    try { payload = await res.json(); } catch { /* server error may not be JSON */ }
    if (!res.ok) {
      const fieldErrors = Object.entries(payload).find(([key, value]) => key !== 'detail' && Array.isArray(value));
      const errorText = typeof payload.detail === 'string' ? payload.detail
        : fieldErrors ? `${fieldErrors[0]}: ${fieldErrors[1].join(' ')}`
        : res.status === 429 ? 'Too many requests. Please try again later.'
        : 'The request could not be completed. Please review your entries.';
      throw new Error(errorText);
    }
    return payload;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out. Please retry.');
    if (e instanceof TypeError) throw new Error('Cannot reach the Django API. Make sure it is running at 127.0.0.1:8000.');
    throw e;
  } finally { clearTimeout(timeout); }
}

function EnquiryFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(INITIAL);
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verification, setVerification] = useState({ status: 'idle', token: '' });
  const lastAttemptKey = useRef('');
  const verificationRequestId = useRef(0);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const initialCategory = searchParams.get('category');
    const initialProduct = searchParams.get('product');
    if (initialCategory && ENQUIRY_PRODUCTS[initialCategory]) {
      setForm((current) => ({ ...current, category: initialCategory,
        product: (ENQUIRY_PRODUCTS[initialCategory].includes(initialProduct) ? initialProduct : '') }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setTimeout(() => setCooldown((count) => Math.max(0, count - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Once the sixth digit is entered (typed, pasted, or autofilled), verify on
  // the server. The short debounce avoids a burst of duplicate submissions.
  useEffect(() => {
    const email = form.email.trim().toLowerCase();
    if (!challenge || email !== verifiedEmail || !/^\d{6}$/.test(otp) ||
        verification.status === 'verified' || busy === 'submit') return undefined;

    const key = `${challenge}:${otp}`;
    if (lastAttemptKey.current === key) return undefined;

    const timer = setTimeout(async () => {
      if (lastAttemptKey.current === key) return;
      lastAttemptKey.current = key;
      const requestId = ++verificationRequestId.current;
      setVerification({ status: 'checking', token: '' });
      setError('');

      try {
        const payload = await postJSON('/enquiry/verify/', {
          challenge_id: challenge, email, otp,
        });
        if (requestId !== verificationRequestId.current) return;
        if (!payload.verified || !payload.verification_token) {
          throw new Error('Verification was not completed. Please try again.');
        }
        setVerification({ status: 'verified', token: payload.verification_token });
        setInfo('');
      } catch (e) {
        if (requestId !== verificationRequestId.current) return;
        setVerification({ status: 'invalid', token: '' });
        setError(e.message);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [challenge, otp, form.email, verifiedEmail, verification.status, busy]);

  const phoneCode = useMemo(() => COUNTRY_DIAL_CODES.find((entry) => entry.iso === form.country_iso)?.dial || '+91', [form.country_iso]);
  const products = ENQUIRY_PRODUCTS[form.category] || [];

  function update(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'category') { next.product = ''; next.other_product = ''; }
      if (name === 'product') next.other_product = '';
      return next;
    });
    setError('');
    if (name === 'email') {
      verificationRequestId.current += 1;
      lastAttemptKey.current = '';
      setVerification({ status: 'idle', token: '' });
      setChallenge(null); setVerifiedEmail(''); setOtp(''); setCooldown(0); setInfo('');
    }
  }

  async function requestOtp() {
    setError(''); setInfo('');
    if (!form.email.trim()) { setError('Enter your email address first.'); return; }
    verificationRequestId.current += 1;
    lastAttemptKey.current = '';
    setVerification({ status: 'idle', token: '' });
    setBusy('otp');
    try {
      const payload = await postJSON('/enquiry/otp/', { email: form.email.trim(), fax_field: form.fax_field });
      setChallenge(payload.challenge_id);
      setVerifiedEmail(form.email.trim().toLowerCase());
      setCooldown(payload.resend_after_seconds || 60);
      setOtp('');
      setInfo(`A 6-digit code was sent to ${form.email.trim()}. It expires in 10 minutes.`);
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  async function submit(e) {
    e.preventDefault();
    setError(''); setInfo('');
    if (!challenge || verifiedEmail !== form.email.trim().toLowerCase()) {
      setError('Verify your current email address by requesting an OTP first.'); return;
    }
    if (verification.status !== 'verified' || !verification.token) {
      setError('Please complete email verification before submitting.'); return;
    }
    if (!form.consent) { setError('Please agree to be contacted about this enquiry.'); return; }
    if (!form.product) { setError('Choose a product from the selected category.'); return; }
    if (NEEDS_CUSTOM(form.product) && !form.other_product.trim()) {
      setError('Please describe the product you need.'); return;
    }
    setBusy('submit');
    try {
      const payload = await postJSON('/enquiry/submit/', {
        ...form, email: form.email.trim(), challenge_id: challenge,
        verification_token: verification.token,
        whatsapp_country_code: phoneCode,
        whatsapp_number: form.whatsapp_number.replace(/[\s()-]/g, ''),
      });
      setResult(payload);
      setChallenge(null);
      setOtp('');
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  if (result) {
    return <div className={styles.confirmation} role="status">
      <div className={styles.confirmIcon} aria-hidden="true">✓</div>
      <h3>Enquiry received</h3>
      <p>Your email has been verified and your enquiry has been recorded.</p>
      <p className={styles.reference}>Reference: <strong>HFG-{String(result.reference).padStart(6, '0')}</strong></p>
      {result.notification_sent === false && <p className={styles.warning}>Your enquiry is saved, but the email alert to our team could not be sent. Please contact support@horizonfieldglobal.com if your enquiry is urgent.</p>}
      <button type="button" className={styles.submit} onClick={() => {
        verificationRequestId.current += 1;
        lastAttemptKey.current = '';
        setResult(null); setForm(INITIAL); setChallenge(null); setVerifiedEmail('');
        setOtp(''); setVerification({ status: 'idle', token: '' });
        setInfo(''); setError(''); setCooldown(0);
      }}>Send another enquiry <span aria-hidden="true">→</span></button>
    </div>;
  }

  return <form onSubmit={submit} className={styles.form} noValidate={false}>
    <div className={styles.row}>
      <label className={styles.field}>Full name <span className={styles.required}>*</span>
        <input autoComplete="name" required maxLength={120} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" />
      </label>
      <label className={styles.field}>Company name <span className={styles.required}>*</span>
        <input autoComplete="organization" required maxLength={180} value={form.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="Your business / organization" />
      </label>
    </div>
    <label className={styles.field}>Company website <span className={styles.optional}>(optional)</span>
      <input type="url" autoComplete="url" maxLength={250} placeholder="https://www.company.com" value={form.company_website} onChange={(e) => update('company_website', e.target.value)} />
    </label>
    <div className={styles.emailRow}>
      <label className={styles.field}>Business email <span className={styles.required}>*</span>
        <input type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@company.com" />
      </label>
      <button type="button" className={styles.otpButton} onClick={requestOtp} disabled={busy !== '' || cooldown > 0 || verification.status === 'verified'}>
        {verification.status === 'verified' ? 'Verified ✓' : busy === 'otp' ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : challenge ? 'Resend OTP' : 'Send OTP'}
      </button>
    </div>
    {/* Show the OTP input at all times. It only activates after the server confirms an email was sent. */}
    <div className={`${styles.otpPanel} ${
      verification.status === 'verified' ? styles.otpVerified :
      verification.status === 'checking' ? styles.otpChecking :
      verification.status === 'invalid' ? styles.otpInvalid :
      challenge ? styles.otpReady : styles.otpWaiting
    }`}>
      <div className={styles.otpHeader}>
        <span className={styles.otpStep}>STEP 02 — VERIFY EMAIL</span>
        <span className={styles.otpState} role="status">
          {verification.status === 'verified' ? '✓ Verified' : verification.status === 'checking' ? 'Verifying…' : verification.status === 'invalid' ? 'Try again' : challenge ? 'Code sent' : 'Awaiting code'}
        </span>
      </div>
      <label className={`${styles.field} ${styles.otpLabel}`} htmlFor="enquiry-email-otp">
        Email verification code <span className={styles.required}>*</span>
      </label>
      <input
        id="enquiry-email-otp"
        className={styles.otpInput}
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        autoComplete="one-time-code"
        maxLength={6}
        aria-describedby="enquiry-otp-hint"
        required
        disabled={!challenge || busy === 'submit'}
        readOnly={verification.status === 'verified' || verification.status === 'checking'}
        aria-invalid={verification.status === 'invalid'}
        value={otp}
        onChange={(e) => {
          if (verification.status === 'verified') return;
          verificationRequestId.current += 1; // Ignore stale responses.
          lastAttemptKey.current = '';
          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
          setVerification({ status: 'idle', token: '' });
          setError('');
        }}
        placeholder="Enter 6-digit OTP"
      />
      <p id="enquiry-otp-hint" className={styles.otpHint}>
        {verification.status === 'verified'
          ? <span className={styles.otpSuccess} role="status" aria-live="polite">✓ Successfully verified</span>
          : verification.status === 'checking'
          ? <span role="status" aria-live="polite">Checking your code securely…</span>
          : challenge
          ? `Enter the code sent to ${verifiedEmail}. Valid for 10 minutes.`
          : 'Click “Send OTP” above. This field becomes active once email delivery succeeds.'}
      </p>
    </div>
    <label className={styles.field}>WhatsApp contact number <span className={styles.required}>*</span>
      <div className={styles.phoneRow}>
        <select aria-label="Country calling code" required value={form.country_iso} onChange={(e) => update('country_iso', e.target.value)} className={styles.codeSelect}>
          {COUNTRY_DIAL_CODES.map((country) => <option key={country.iso} value={country.iso}>{country.name} ({country.dial})</option>)}
        </select>
        <input type="tel" inputMode="tel" autoComplete="tel-national" minLength={6} maxLength={24} pattern="[0-9 ()-]{6,24}" required value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="WhatsApp number" aria-label="WhatsApp number without country code" />
      </div>
    </label>
    <div className={styles.row}>
      <label className={styles.field}>Product category <span className={styles.required}>*</span>
        <select required value={form.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">Select category</option>
          {ENQUIRY_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className={styles.field}>Product / enquiry type <span className={styles.required}>*</span>
        <select required disabled={!form.category} value={form.product} onChange={(e) => update('product', e.target.value)}>
          <option value="">{form.category ? 'Choose a product' : 'Select category first'}</option>
          {products.map((product) => <option key={product} value={product}>{product}</option>)}
        </select>
      </label>
    </div>
    {NEEDS_CUSTOM(form.product) && <label className={styles.field}>Specify your product <span className={styles.required}>*</span>
      <input required maxLength={160} value={form.other_product} onChange={(e) => update('other_product', e.target.value)} placeholder="Product name or specifications" />
    </label>}
    <div className={styles.row}>
      <label className={styles.field}>Required quantity <span className={styles.optional}>(optional)</span>
        <input maxLength={100} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} placeholder="e.g. 1 container / 27 MT" />
      </label>
      <label className={styles.field}>Destination / port <span className={styles.optional}>(optional)</span>
        <input maxLength={160} value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="e.g. Jebel Ali, UAE" />
      </label>
    </div>
    <label className={styles.field}>Additional requirements <span className={styles.optional}>(optional)</span>
      <textarea rows={3} maxLength={2500} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Specifications, packaging, delivery terms, other products…" />
    </label>
    <div className={styles.trap} aria-hidden="true"><label>Leave empty<input tabIndex={-1} autoComplete="off" value={form.fax_field} onChange={(e) => update('fax_field', e.target.value)}/></label></div>
    <label className={styles.consent}><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} required />
      <span>I agree that Horizonfield Global may contact me about this business enquiry.</span>
    </label>
    {info && <div className={styles.info} role="status">{info}</div>}
    {error && <div className={styles.error} role="alert">{error}</div>}
    <button className={styles.submit} disabled={busy !== '' || verification.status !== 'verified' || !verification.token} type="submit">
      {busy === 'submit' ? 'Submitting enquiry…' : 'Submit verified enquiry'} <span aria-hidden="true">→</span>
    </button>
    <p className={styles.bottomNote}>Email verification is required before submitting. We use your details only to respond to your enquiry.</p>
  </form>;
}

export default function VerifiedEnquiryForm() {
  return <Suspense fallback={<div className={styles.loading}>Loading enquiry form…</div>}><EnquiryFormInner /></Suspense>;
}
