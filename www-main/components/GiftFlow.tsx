import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { TrashIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import { ChangeEvent, createRef, InputHTMLAttributes, useRef, useState } from 'react';

import appConfig from '../appConfig';
import useCourseFilterSearch from '../hooks/useCourseFilterSearch';
import { Course } from '../models/contentful';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';
import Button from './Button';
import Card from './Card';
import CoursePrice from './CoursePrice';
import Layout from './Layout';
import { emailRegex } from './NewsletterSignup';
import StripeGiftButton from './StripeGiftButton';
import Text from './Text';
import TextArea from './TextArea';
import TextInput from './TextInput';

interface FormComponent {
  label: string;
  id: string;
  value: string;
  attributes: InputHTMLAttributes<HTMLInputElement>;
  validator: (input: string) => boolean;
  errorText: string;
}

const buildInputs = (user?: UserProfile): FormComponent[] => {
  return [
    {
      label: 'To',
      id: 'toName',
      value: '',
      validator: (input: string) => input.trim().length > 0,
      errorText: 'Must be at least 1 character',
      attributes: {
        required: true,
        placeholder: "Enter recipient's name here",
      },
    },
    {
      label: "Recipient's Email",
      id: 'toEmail',
      value: '',
      validator: (input: string) => emailRegex.test(input),
      errorText: "Hmm... that doesn't look like a valid email address format",
      attributes: {
        required: true,
        type: 'email',
        placeholder: "Enter recipient's email address here",
      },
    },
    {
      label: 'From',
      id: 'fromName',
      value: user?.nickname ?? '',
      validator: (input: string) => input.trim().length > 0,
      errorText: 'Must be at least 1 character',
      attributes: {
        required: true,
        placeholder: 'Enter your name here',
      },
    },
    {
      label: 'Your Email',
      id: 'fromEmail',
      value: user?.email ?? '',
      validator: (input: string) => emailRegex.test(input),
      errorText: "Hmm... that doesn't look like a valid email address format",
      attributes: {
        required: true,
        type: 'email',
        placeholder: 'Enter your email address here',
      },
    },
  ];
};

const tabs = { 1: 'Select Courses', 2: 'Gift Details', 3: 'Checkout' } as Record<string, string>;

export default function GiftFlow({ courses }: { courses: Course[] }) {
  const titleRef = createRef<HTMLDivElement>();
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState(1);
  const { filterComponent, matchingCourses: wideMatches } = useCourseFilterSearch(
    courses,
    'Select Courses',
    "You can select as many courses as you'd like to send as a gift"
  );
  const matchingCourses = wideMatches as Course[];
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [textInputValues, setTextInputValues] = useState<Record<string, string>>(() => ({
    ...buildInputs(user).reduce((a, c) => {
      a[c.id] = c.value;
      return a;
    }, {} as Record<string, string>),
    giftNote: '',
  }));
  const touchedFields = useRef(new Set());

  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    setTextInputValues({
      ...textInputValues,
      [e.target.id]: e.target.value,
    });
    touchedFields.current.add(e.target.id);
  };

  const handleTabChange = (newTab: string) => {
    titleRef.current?.scrollIntoView();
    setCurrentTab(Number(newTab));
  };

  const resolvedSelectedCourses = courses.filter((course) =>
    selectedCourses.map((sc) => sc.sys.id).includes(course.sys.id)
  );
  const { toName, toEmail, fromName, fromEmail, giftNote } = textInputValues;

  const giftDetailsErrors = buildInputs(user)
    .map((input) => ({ id: input.id, validator: input.validator, errorText: input.errorText }))
    .reduce((acc, cur) => {
      const value = textInputValues[cur.id];
      const isValid = cur.validator(value);
      if (!isValid && touchedFields.current.has(cur.id)) {
        acc[cur.id] = cur.errorText;
      }
      return acc;
    }, {} as Record<string, string>);

  return (
    <Layout title="Give a Gift" description="Bright Trip">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mt-3 dark:text-gray-200">Gift Courses</h1>
        <div className="relative flex w-96 items-center justify-center">
          <div
            className="absolute inset-0 -mt-48 flex items-center justify-center pt-48"
            aria-hidden="true"
            ref={titleRef}
          >
            <div className="relative -top-0.5 h-0.5 w-64 bg-gray-200 dark:hidden" />
          </div>
          <div className="z-10 mt-7 flex items-start justify-evenly">
            {Object.keys(tabs).map((stepNumber) => {
              const isCurrent = currentTab === Number(stepNumber);
              const isComplete = stepNumber === '1' && resolvedSelectedCourses.length;
              return (
                <div key={stepNumber} className="flex w-28 flex-col items-center justify-center">
                  <Button
                    aria-label={`Go to step ${stepNumber}`}
                    onClick={stepNumber !== '3' ? () => handleTabChange(stepNumber) : () => null}
                    variant={isCurrent || isComplete ? 'secondary' : 'background'}
                    icon={
                      <span
                        className={`${
                          isCurrent || isComplete ? 'text-white' : 'text-gray-800 dark:text-gray-400'
                        } text-body`}
                      >
                        {isComplete ? '✓' : stepNumber}
                      </span>
                    }
                  />
                  {/* {(isCurrent || isComplete) && ( */}
                  <span
                    className={`font-bodycopy mt-3 text-bodySmall ${
                      isCurrent ? 'text-black dark:text-gray-200' : 'text-gray-500'
                    }`}
                  >
                    {tabs[stepNumber]}
                  </span>
                  {/* )} */}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-12">
        {currentTab === 1 && (
          <div className="relative">
            {filterComponent}
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
              {matchingCourses
                .filter((c) => c.fields.price !== 0)
                .map((course) => {
                  const isSelected = selectedCourses?.map((sc) => sc.sys.id).includes(course.sys.id);
                  return (
                    <div key={course.sys.id}>
                      <Card
                        imageUrl={course.fields.tileThumbnail?.fields.file.url ?? ''}
                        imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      >
                        <Text As="h3" variant="body" className="sr-only">
                          {course.fields.title}
                        </Text>
                      </Card>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-subtitle1 font-bold dark:text-gray-300">{course.fields.title}</p>
                          <p className="text-body text-bt-teal dark:text-bt-teal-light font-bodycopy">
                            with {course.fields.creator?.fields.name}
                          </p>
                        </div>
                        <Button
                          size="extraSmall"
                          className="px-4"
                          variant={isSelected ? 'secondary' : 'background'}
                          onClick={() =>
                            isSelected
                              ? setSelectedCourses(selectedCourses.filter((x) => x.sys.id !== course.sys.id))
                              : setSelectedCourses([...selectedCourses, course])
                          }
                        >
                          Select{isSelected ? 'ed' : ''}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="sticky bottom-[1rem] mt-6 flex flex-col items-start justify-between gap-6 rounded-2xl bg-bt-teal dark:bg-bt-teal-dark text-white p-6 shadow-md md:flex-row md:items-center md:gap-0">
              <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-6">
                <h4 className="text-subtitle1 font-bold whitespace-nowrap">
                  Selected Course{selectedCourses.length > 1 ? 's' : ''}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.length ? (
                    selectedCourses.map((sc) => (
                      <div
                        key={sc.sys.id}
                        className="flex items-center gap-2 rounded-full border border-bt-teal-light bg-white bg-opacity-10 text-white py-2 px-4 shadow-md"
                      >
                        <span className="text-body font-bold">{sc.fields.title}</span>
                        <button
                          aria-label={`Remove ${sc.fields.title} from selected courses`}
                          onClick={() =>
                            setSelectedCourses(selectedCourses.filter((course) => course.sys.id !== sc.sys.id))
                          }
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="py-2 text-body opacity-60">No courses selected</span>
                  )}
                </div>
              </div>
              <Button
                variant="background"
                onClick={() => handleTabChange(String(currentTab + 1))}
                disable={!selectedCourses}
                className="whitespace-nowrap px-5"
              >
                Continue to {tabs[currentTab + 1]}
              </Button>
            </div>
          </div>
        )}
        {currentTab === 2 && (
          <div className="mx-auto max-w-xl rounded-2xl p-8 shadow-md bg-bt-background-light dark:bg-gray-800">
            <h2 className="text-2xl font-bold dark:text-gray-300">Gift Details</h2>
            <div className="mt-6 space-y-6">
              {buildInputs().map((input) => (
                <div key={input.id}>
                  <TextInput
                    {...input.attributes}
                    id={input.id}
                    label={input.label}
                    value={textInputValues[input.id]}
                    onChange={handleTextInputChange}
                  />
                  {giftDetailsErrors[input.id] ? (
                    <p className="text-caption text-red-600 mt-0.5 font-bold">{input.errorText}</p>
                  ) : null}
                </div>
              ))}
              <TextArea
                id="giftNote"
                label="Gift Note"
                value={textInputValues.giftNote}
                onChange={handleTextInputChange}
                placeholder="Example: Happy birthday! Enjoy this course!"
              />
            </div>
            <h2 className="text-subtitle1 font-bold text-gray-800 dark:text-gray-300 mt-6 mb-1">Courses</h2>
            <div className="divide-y">
              {selectedCourses ? (
                selectedCourses.map((sc) => (
                  <div key={sc.sys.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-x-3">
                      <Image
                        src={sc.fields.tileThumbnail?.fields.file.url ?? ''}
                        className="h-20 rounded-md object-cover"
                        alt=""
                        width="80"
                        height="80"
                        loader={contentfulImageLoader}
                      />
                      <div>
                        <h3 className="text-xl font-bold dark:text-gray-300">{sc.fields.title}</h3>
                        <span className="text-bt-teal font-bodycopy dark:text-bt-teal-light">
                          with {sc.fields.creator?.fields.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <CoursePrice courseId={sc.sys.id} As="h4" variant="body" price={sc.fields.price ?? 0} />
                      <button
                        aria-label={`Remove ${sc.fields.title} from selected courses`}
                        onClick={() =>
                          setSelectedCourses(selectedCourses.filter((course) => course.sys.id !== sc.sys.id))
                        }
                      >
                        <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <Button variant="background" onClick={() => setCurrentTab(1)}>
                  Select a course
                </Button>
              )}
            </div>
            <div className="mt-8">
              {resolvedSelectedCourses ? (
                <StripeGiftButton
                  giftedCourse={resolvedSelectedCourses}
                  toEmail={toEmail}
                  fromEmail={fromEmail}
                  toName={toName}
                  fromName={fromName}
                  giftNote={giftNote}
                  disabled={Object.keys(giftDetailsErrors).length > 0}
                  className="rounded-full px-5 shadow-none drop-shadow-none"
                />
              ) : null}
              {appConfig.features.giveOneGetOneCampaignIsEnabled && (
                <div className="mt-8 bg-gray-100 p-4 rounded-md">
                  <p>
                    We&apos;ll email you after your purchase to claim your course in the &quot;Give one, get one&quot;
                    promotion
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
