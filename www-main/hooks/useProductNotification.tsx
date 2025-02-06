import { ChangeEvent, FormEvent, useState } from 'react';
import Modal from '../components/Modal';
import { emailRegex } from '../components/NewsletterSignup';
import TextInput from '../components/TextInput';
import { useBrightTripUser } from './useBrightTripUser';

export function useProductNotification(modalTitle: string, productName: string) {
  const { user } = useBrightTripUser();
  const [userEmail, setUserEmail] = useState(user?.email ?? '');
  const [userFirstName, setUserFirstName] = useState(user?.firstName ?? '');
  const [newsletterOptedIn, setNewsletterOptedIn] = useState(true);
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('There was a problem signing you up for notifications');

  const handleUserEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value.trim());
  };
  const handleUserFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserFirstName(e.target.value.trim());
  };
  const hanldeNewsletterCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewsletterOptedIn(e.target.checked);
  };
  const handleNotificationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userFirstName) {
      setErrorMessage('First name is a required field');
      setNotifyStatus('error');
      return;
    }
    if (!emailRegex.test(userEmail)) {
      setErrorMessage("This doesn't look like a valid email address");
      setNotifyStatus('error');
      return;
    }
    setNotifyStatus('pending');
    try {
      const notificationResponse = await fetch(`/api/notify`, {
        method: 'POST',
        body: JSON.stringify({
          userEmail,
          productName,
          newsletterOptedIn,
        }),
      });
      if (notificationResponse.ok && notificationResponse.status === 200) {
        setNotifyStatus('success');
        setTimeout(() => {
          setShowNotifyModal(false);
          setNotifyStatus('idle');
          setUserEmail(user?.email ?? '');
        }, 2000);
      }
      if (notificationResponse.status === 409) {
        setErrorMessage("You've already signed up for notifications");
        setNotifyStatus('error');
      }
      if (notificationResponse.status === 500) {
        setNotifyStatus('error');
      }
    } catch (error) {
      setNotifyStatus('error');
    }
  };

  const notifyModal = (
    <Modal open={showNotifyModal} onClose={() => setShowNotifyModal(false)}>
      <form className="p-8 text-left flex flex-col items-center" onSubmit={handleNotificationSubmit}>
        <h1 className="mb-4 text-headline6 font-bold max-w-sm dark:text-gray-200">{modalTitle}</h1>
        <fieldset className="space-y-4 w-full">
          <TextInput label="First name" id="first-name" value={userFirstName} onChange={handleUserFirstNameChange} />
          <TextInput label="Email address" id="email-address" value={userEmail} onChange={handleUserEmailChange} />
          <label
            htmlFor="newsletter-checkbox"
            className="font-bodycopy flex gap-2 items-center text-sm mt-3 dark:text-gray-300"
          >
            <input
              type="checkbox"
              id="newsletter-checkbox"
              checked={newsletterOptedIn}
              onChange={hanldeNewsletterCheckboxChange}
              className="rounded-md text-bt-teal"
            />
            Also get our free travel newsletter
          </label>
        </fieldset>
        <button
          type="submit"
          disabled={notifyStatus !== 'idle' && notifyStatus !== 'error'}
          className="mt-6 bg-bt-teal text-white font-bold px-6 py-2 shadow-bt-teal-ultraLight rounded-full"
        >
          {notifyStatus === 'success'
            ? 'Signed up!'
            : notifyStatus === 'pending'
            ? 'Submitting...'
            : 'Sign up for updates'}
        </button>
        {notifyStatus === 'error' && <p className="font-bodycopy text-red-600 text-center mt-2">{errorMessage}</p>}
      </form>
    </Modal>
  );

  const openModal = () => setShowNotifyModal(true);

  return { openModal, notifyModal };
}
