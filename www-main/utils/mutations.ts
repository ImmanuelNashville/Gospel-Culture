export const redeemCourseWithCode = async (redemptionCode: string) => {
  const response = await fetch('/api/redeem', {
    method: 'POST',
    body: JSON.stringify({
      code: redemptionCode,
    }),
  });
  if (response.ok && response.status === 200) {
    const data: { redirectUrl: string } = await response.json();
    return data;
  }
  const data: { msg: string } = await response.json();
  throw new Error(data.msg);
};

export const updateSubscription = async ({
  subscriptionId,
  cancelAtPeriodEnd,
}: {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
}) => {
  const response = await fetch('/api/subscription/cancel', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId, cancelAtPeriodEnd }),
  });
  if (response.status === 200 && response.ok) {
    const { message } = await response.json();
    if (message === 'ok') {
      return message;
    } else {
      throw new Error(`Error in Stripe cancelling subscription. Subscription ID: ${subscriptionId}`);
    }
  } else {
    throw new Error(`Error in node layer of /api/subscription/cancel. Subscription ID: ${subscriptionId}`);
  }
};
