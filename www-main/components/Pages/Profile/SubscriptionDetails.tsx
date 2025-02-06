import { TagIcon } from '@heroicons/react/solid';
import { format } from 'date-fns';
import { useState } from 'react';
import type Stripe from 'stripe';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserDataContext } from '../../../hooks/useUserDataContext';
import { capitalize, toUsd } from '../../../utils';
import Modal from '../../Modal';
import Text from '../../Text';
import Spinner from '../../Spinner';
import { getActiveSubscription, QK_ACTIVE_SUBSCRIPTION } from '../../../utils/queries';
import { FaunaUserData } from '../../../models/fauna';
import { updateSubscription } from '../../../utils/mutations';

interface SubscriptionProps {
  user: FaunaUserData;
}

const formatStripeSubDate = (timeInSeconds: number) => {
  return format(timeInSeconds * 1000, 'LLLL do, yyyy');
};

const SubscriptionDetails = ({ user }: SubscriptionProps) => {
  const [selectedSubscription, setSelectedSubscription] = useState<Stripe.Subscription>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: [QK_ACTIVE_SUBSCRIPTION],
    queryFn: getActiveSubscription,
    enabled: Boolean(user?.email),
  });
  const subscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK_ACTIVE_SUBSCRIPTION] });
      setSelectedSubscription(undefined);
    },
  });
  const { subList, upcomingInvoices, promoCodes } = data ?? {};
  const { enrolledCourses } = useUserDataContext();

  const subCourses = enrolledCourses.filter((c) => c.type === 'subscription' && c.fields.price !== 0) ?? [];
  const subCourseNames = subCourses.length ? subCourses.map((c) => c.fields.title) : [];

  return (
    <>
      {isLoading && (
        <div className="w-10 mx-auto my-8 opacity-40">
          <Spinner />
        </div>
      )}
      {subList &&
        Array.isArray(subList.data) &&
        subList.data.map((sub: Stripe.Subscription) => {
          const nextInvoice = upcomingInvoices?.[sub.id];
          const willCancel = sub.cancel_at_period_end;
          const promoName = promoCodes?.[sub.id]?.code ?? sub.discount?.coupon.name ?? '';
          const planPrice = toUsd(sub.items.data[0].plan.amount ?? 0);
          const isDiscounted = Boolean(nextInvoice?.discount);
          const planPriceCrossOut = isDiscounted ? (
            <span className="line-through text-gray-500">{planPrice}</span>
          ) : (
            <></>
          );
          const nextInvoiceTotal = toUsd(nextInvoice?.total ?? 0);
          const nextInvoicePaymentInfo = nextInvoice?.next_payment_attempt
            ? `${nextInvoiceTotal} on ${formatStripeSubDate(nextInvoice.next_payment_attempt)}`
            : '';

          return (
            <div key={sub.id} className="flex flex-col items-center">
              <dl className="divide-y w-full dark:divide-gray-600 dark:text-gray-300">
                <div className="flex justify-between items-baseline py-2.5">
                  <dt>
                    <p className="text-body font-bold">Your Plan</p>
                  </dt>
                  <dd>
                    <p className="text-body font-bodycopy">{capitalize(sub.items.data[0].plan.interval)}ly</p>
                  </dd>
                </div>
                <div className="flex justify-between items-baseline py-2.5">
                  <dt>
                    <p className="text-body font-bold">Status</p>
                  </dt>
                  <dd>
                    <p className="text-body font-bodycopy">
                      {willCancel && sub.cancel_at
                        ? `Expires ${formatStripeSubDate(sub.cancel_at)}`
                        : capitalize(sub.status)}
                    </p>
                  </dd>
                </div>
                <div className="flex justify-between items-start py-2.5">
                  <dt>
                    <p className="text-body font-bold">Next Charge</p>
                  </dt>
                  <dd className="text-right">
                    <p className="text-body font-bodycopy">
                      {nextInvoice && nextInvoice?.next_payment_attempt ? (
                        <>
                          {planPriceCrossOut} {nextInvoicePaymentInfo}
                        </>
                      ) : (
                        <>None</>
                      )}
                    </p>
                  </dd>
                </div>
                {nextInvoice?.discount ? (
                  <div className="flex justify-between items-baseline py-2.5">
                    <dt>
                      <p className="text-body font-bold">Promo</p>
                    </dt>
                    <dd className="flex flex-col gap-1 items-end">
                      {promoName ? (
                        <span className="w-fit text-bodySmall font-bodycopy px-2 py-1 bg-bt-teal-ultraLight/20 text-bt-teal dark:text-bt-teal-light rounded-md font-bold flex items-center gap-1">
                          <TagIcon className="w-4 h-4 text-bt-teal" />
                          {promoName}
                        </span>
                      ) : null}
                      <span className="text-bodySmall text-gray-800 dark:text-gray-300">
                        {nextInvoice.discount.coupon.percent_off}% off
                        {nextInvoice.discount.end
                          ? ` until ${formatStripeSubDate(nextInvoice.discount.end)}`
                          : ' while subscribed'}
                      </span>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <button
                className={`rounded-full border dark:border-white/20 px-4 py-2 shadow-sm mt-4 ${
                  sub.cancel_at_period_end
                    ? 'text-white bg-bt-orange'
                    : 'bg-white dark:bg-white/10 text-red-600 dark:text-red-300 dark:hover:bg-white/20'
                }`}
                onClick={() => {
                  if (sub.cancel_at_period_end) {
                    subscriptionMutation.mutate({
                      subscriptionId: sub.id,
                      cancelAtPeriodEnd: !sub.cancel_at_period_end,
                    });
                  } else {
                    setSelectedSubscription(sub);
                  }
                }}
              >
                {sub.cancel_at_period_end ? 'Resume' : 'Cancel'} Subscription
              </button>
            </div>
          );
        })}
      <Modal open={Boolean(selectedSubscription && user.subscribed)} onClose={() => setSelectedSubscription(undefined)}>
        <div className="max-w-lg">
          <div className="p-8 text-gray-700 dark:text-gray-300">
            <Text As="h1" variant="headline6" className="mb-4">
              Are you sure you want to cancel?
            </Text>

            {subCourseNames.length ? (
              <>
                <p className="text-left text-body font-bodycopy">
                  Cancellation will be effective at the end of your current billing period on{' '}
                  <span className="font-bold text-black dark:text-white">
                    {selectedSubscription?.current_period_end &&
                      formatStripeSubDate(selectedSubscription.current_period_end)}
                  </span>
                  . At that time, you will lose access to these courses you&apos;re currently taking:
                </p>
                <ul className="text-left max-w-max mx-auto mb-2 withBTBullets py-2">
                  {subCourseNames.map((name) => (
                    <li key={name} className="font-bold my-2 dark:text-gray-200">
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="text-left mb-4 text-body font-bodycopy">
              Come back anytime! We&apos;ll keep your progress on these subscription courses for now. If you resubscribe
              during the next year, you&apos;ll be able to pick up right where you left off.
            </p>
            <p className="text-left text-body font-bodycopy">
              You&apos;ll still have access to any courses you purchased directly regardless of your subscription
              status.
            </p>
          </div>
          <div className="w-full space-y-4 bg-bt-teal-ultraLight/20 border-t border-gray-100 dark:border-transparent p-8">
            <button
              className="w-full rounded-full text-subtitle1 py-2.5 bg-bt-teal text-white"
              onClick={() => setSelectedSubscription(undefined)}
              disabled={subscriptionMutation.isLoading}
            >
              Go Back
            </button>
            {selectedSubscription && (
              <button
                className="w-full border rounded-full text-subtitle1 py-2.5 bg-bt-background-light dark:bg-white/10 text-red-600 dark:text-red-300 dark:border-white/20 dark:hover:text-red-400"
                onClick={() => {
                  subscriptionMutation.mutate({
                    subscriptionId: selectedSubscription.id,
                    cancelAtPeriodEnd: !selectedSubscription.cancel_at_period_end,
                  });
                }}
                disabled={subscriptionMutation.isLoading}
              >
                {subscriptionMutation.isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
export default SubscriptionDetails;
