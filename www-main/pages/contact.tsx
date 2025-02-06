import { ChangeEvent, FC, FormEvent, useRef, useState } from 'react';
import Recaptcha, { ReCAPTCHA } from 'react-google-recaptcha';
import Layout from '../components/Layout';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';
import { useBrightTripUser } from '../hooks/useBrightTripUser';
import Button from '../components/Button';
import { MailIcon } from '@heroicons/react/outline';

const Contact: FC = () => {
  const { user } = useBrightTripUser();
  const [formValues, setFormValues] = useState({
    fullName: user ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}` : '',
    email: user?.email ?? '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const captchaRef = useRef<ReCAPTCHA | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const captchaToken = await captchaRef.current?.executeAsync();
    captchaRef.current?.reset();

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ ...formValues, captchaToken }),
    });

    if (response.status === 200 && response.ok) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <Layout title="Contact" description="Bright Trip">
      <main className="mx-auto mt-4 flex max-w-screen-lg flex-col overflow-hidden rounded-lg shadow-md md:grid md:grid-cols-3">
        <aside className="space-y-4 bg-gradient-to-br from-bt-teal to-bt-teal-light dark:to-bt-teal-light/20  p-6 pb-8 text-white">
          <h1 className="text-3xl font-bold">Get In Touch</h1>
          <p className="text-body  font-bodycopy">Write to us and we will get back to you as soon as possible.</p>
          <p className="text-body  font-bodycopy">
            Fill out this form, or give us a call at{' '}
            <a href="tel:(813) 670-2409" className="underline">
              (813) 670-2409
            </a>
          </p>
          <p className="text-body font-bodycopy">We&apos;re here to help!</p>
          <p className="text-body font-bodycopy">– The Bright Trip Team</p>
        </aside>
        <form
          className="col-span-2 space-y-4 p-6 flex flex-col bg-bt-background-light dark:bg-gray-800 items-center"
          onSubmit={handleSubmit}
        >
          <TextInput
            id="fullName"
            label="Full Name"
            value={formValues.fullName}
            onChange={handleTextChange}
            placeholder="Enter your full name"
          />
          <TextInput
            id="email"
            label="Email"
            value={formValues.email}
            onChange={handleTextChange}
            placeholder="Enter your email address"
          />
          <TextArea
            id="message"
            label="Message"
            value={formValues.message}
            onChange={handleTextChange}
            placeholder="How can we help?"
          />
          <Button type="submit" variant="secondary" icon={<MailIcon />} className="px-5">
            Send Message
          </Button>
          {status !== 'idle' && (
            <Text As="p" variant="caption" className="text-center">
              {status === 'submitting' && 'Submitting...'}
              {status === 'error' && 'Something went wrong'}
              {status === 'success' && 'Sent! We will be in touch soon'}
            </Text>
          )}
        </form>
      </main>
      <Recaptcha sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''} size="invisible" ref={captchaRef} />
    </Layout>
  );
};

export default Contact;
