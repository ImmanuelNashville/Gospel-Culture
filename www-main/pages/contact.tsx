// pages/contact.tsx
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MailIcon } from 'lucide-react';

const ContactPage = () => {
  const [formValues, setFormValues] = useState({ fullName: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit triggered');
    setStatus('sending');

    const captchaToken = await recaptchaRef.current?.executeAsync();
    console.log('📦 captchaToken:', captchaToken);
    recaptchaRef.current?.reset();

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formValues, captchaToken }),
    });

    console.log('📬 contact API response:', res.status);

    if (res.ok) {
      setStatus('success');
      setFormValues({ fullName: '', email: '', message: '' });
    } else {
      setStatus('error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-bt-off-white min-h-screen px-4 pt-20 pb-24">
        <div className="mx-auto max-w-screen-lg bg-white rounded-lg shadow-md overflow-hidden md:grid md:grid-cols-3">
          {/* Left Panel */}
          <aside className="space-y-4 leading-relaxed bg-teal-700 p-6 pb-8 text-white">
            <h1 className="text-3xl font-bold">Get In Touch</h1>
            <p>Write to us and we will get back to you as soon as possible.</p>
            <p>
              Fill out this form, or give us a call at{' '}
              <a href="tel:8136702409" className="underline font-medium">
                (855) 123-4567
              </a>
            </p>
            <p>We’re here to help!</p>
            <p className="font-semibold">– The Gospel Culture Team</p>
          </aside>

          {/* Form Panel */}
          <form
            onSubmit={handleSubmit}
            className="p-8 md:col-span-2 flex flex-col justify-center space-y-4"
          >
            <div>
              <label className="mb-2 font-medium block">Full Name</label>
              <input
                name="fullName"
                required
                className="p-3 border rounded w-full"
                placeholder="Enter your full name"
                onChange={handleChange}
                value={formValues.fullName}
              />
            </div>

            <div>
              <label className="mb-2 font-medium block">Email</label>
              <input
                name="email"
                type="email"
                required
                className="p-3 border rounded w-full"
                placeholder="Enter your email"
                onChange={handleChange}
                value={formValues.email}
              />
            </div>

            <div>
              <label className="mb-2 font-medium block">Message</label>
              <textarea
                name="message"
                required
                className="p-3 border rounded w-full h-32"
                placeholder="How can we help?"
                onChange={handleChange}
                value={formValues.message}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-md flex items-center justify-center space-x-2"
            >
              <MailIcon size={18} />
              <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
            </button>

            {status === 'success' && <p className="text-green-600">Message sent!</p>}
            {status === 'error' && <p className="text-red-600">Something went wrong.</p>}
          </form>
        </div>
      </main>
      <Footer />
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        size="invisible"
        ref={recaptchaRef}
      />
    </>
  );
};

export default ContactPage;
