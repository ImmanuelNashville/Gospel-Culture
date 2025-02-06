import { useRouter } from 'next/router';

export function useTimestampParam() {
  const router = useRouter();

  const hasTimestampParam = Boolean(router.query.t);
  const timestampAsNumber = Number(router.query.t);
  const timestampIsValidNumber = !isNaN(Number(timestampAsNumber));

  if (hasTimestampParam && timestampIsValidNumber) {
    return timestampAsNumber;
  }

  return undefined;
}
