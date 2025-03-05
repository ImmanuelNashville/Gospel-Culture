'use client';

import { ChangeEvent, FC, FormEvent, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import Spinner from './Spinner';
import TextInput from './TextInput';

type SubmitStatus = 'idle' | 'submitting' | 'error' | 'success';

const initialFormValues = {
  firstName: '',
  email: '',
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const NewsletterSignup: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const handleModalClose = () => {
    setShowModal(false);
    setSubmitStatus('idle');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const emailIsValid = formValues.email && emailRegex.test(formValues.email);
  const formIsValid = Boolean(emailIsValid && formValues.firstName);
  const shouldDisableSubmit = !formIsValid || submitStatus === 'submitting';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (shouldDisableSubmit) return;

    setSubmitStatus('submitting');

    setTimeout(() => {
      setSubmitStatus('success');
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus('idle');
        setFormValues(initialFormValues);
      }, 2000);
    }, 1000);
  };

  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'error':
        return 'Something went wrong. Refresh the page and try again.';
      case 'success':
        return "You're subscribed!";
      default:
        return '';
    }
  };

  return (
    <>
      <div className="w-72 text-left bg-gray-200 dark:bg-gray-800 p-6 rounded-xl">
        <p className="text-subtitle1 font-bold mb-2 text-gray-800 dark:text-gray-300">Get Our Newsletter</p>
        <p className="font-bodycopy text-body mb-4 text-gray-600 dark:text-gray-300">
          The latest news, articles, and resources, sent to your inbox weekly.
        </p>
        <Button size="small" variant="secondary" className="px-5" onClick={() => setShowModal(true)}>
          Sign Up
        </Button>
      </div>
      <Modal open={showModal} onClose={handleModalClose}>
        <div className="m-6 min-w-min space-y-2 text-left">
          <h1 className="text-2xl font-bold dark:text-gray-200">The Gospel Culture Newsletter</h1>
          <p className="pb-4 text-bodySmall font-bodycopy max-w-md dark:text-gray-300">
            Get the latest updates from the Gospel Culture team delivered straight to your email inbox. No spam,
            unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput label="First Name" id="firstName" value={formValues.firstName} onChange={handleInputChange} />
            <TextInput label="Email Address" id="email" value={formValues.email} onChange={handleInputChange} />
            <div className="pt-4">
              <Button
                className="px-7"
                disable={shouldDisableSubmit}
                icon={submitStatus === 'submitting' && <Spinner />}
              >
                {submitStatus === 'submitting' ? 'Submitting' : 'Sign Up'}
              </Button>
              <span className="font-body font-bold ml-4 dark:text-gray-300">{getStatusMessage()}</span>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default NewsletterSignup;
