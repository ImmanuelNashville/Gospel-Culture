// components/NewsletterModal.tsx
'use client';

import { ChangeEvent, FC, FormEvent, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import Spinner from './Spinner';
import TextInput from './TextInput';

type SubmitStatus = 'idle' | 'submitting' | 'error' | 'success';

interface NewsletterModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormValues = {
  firstName: '',
  email: '',
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const NewsletterModal: FC<NewsletterModalProps> = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

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
        onClose();
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
    <Modal open={open} onClose={onClose}>
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
  );
};

export default NewsletterModal;