import { Popover } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/outline';
import { TagIcon } from '@heroicons/react/solid';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import appConfig from '../appConfig';
import Button from '../components/Button';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import { validatePromoCodeFormat } from '../utils/promo-codes';

export interface PromoCode {
  code: string;
  percentageDiscount: number;
  allowedCourses?: string[];
}

const usePromoCodeInput = (courseIds: string[]) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string>();
  const [codeData, setCodeData] = useState<PromoCode>();
  const manuallyCleared = useRef(false);
  const params = useSearchParams();
  const pc = params?.get('pc');
  const c = params?.get('c');
  const { mutate: applyPromo } = useMutation({
    mutationFn: async ({ code, courseIds }: { code: string; courseIds: string[] }) => {
      if (!validatePromoCodeFormat(code)) {
        throw new Error('Not a valid promo code');
      }
      const response = await fetch('/api/promo', {
        method: 'PUT',
        body: JSON.stringify({
          code: code.trim(),
          courseIds,
        }),
      });
      if (response.ok && response.status === 200) {
        const responseData = (await response.json()) as PromoCode;
        return responseData;
      } else if (response.status >= 400 && response.status < 500) {
        throw new Error(await response.text());
      } else {
        throw new Error('Something went wrong validating this promo code');
      }
    },
    onError: (error) => {
      setError(String(error));
    },
    onSuccess: (data) => {
      setCodeData(data);
      setInputValue('');
    },
  });

  useEffect(() => {
    if (typeof pc === 'string' && c && codeData?.code !== pc && manuallyCleared.current === false) {
      applyPromo(
        { code: pc, courseIds: typeof c === 'string' ? [c] : c },
        {
          onSettled: () => console.log('tried to set auto code'),
          onError: (error) => console.log('failed to set auto code', error),
          onSuccess: () => console.log('set auto code successfully'),
        }
      );
    }
  }, [pc, c, applyPromo, codeData?.code]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (manuallyCleared.current === false) {
      manuallyCleared.current = true;
    }
    setInputValue(e.target.value);
  };

  const PromoCodeIcon = (
    <div className="rounded-full bg-bt-teal-ultraLight/20 p-1.5">
      <TagIcon className="h-4 w-4 text-bt-teal" />
    </div>
  );

  const PromoCodeDescription = (
    <div className="flex gap-3 rounded-lg bg-bt-teal-ultraLight/20 px-3 py-1">
      <p className="text-bodySmall text-bt-teal dark:text-bt-teal-ultraLight">
        Promo code <strong>{codeData?.code}</strong> applied
      </p>
      <button
        onClick={() => {
          manuallyCleared.current = true;
          setCodeData(undefined);
        }}
        aria-label="Remove promo code"
      >
        <TrashIcon className="h-3 w-3 text-bt-teal dark:text-bt-teal-light" />
      </button>
    </div>
  );

  const promoInputBuilder = (button: ReactNode) => {
    return (
      <Popover className={`relative ${appConfig.sale.isActive ? 'hidden' : ''}`}>
        {button}
        <Popover.Panel className="absolute right-0 z-10">
          {({ close }) => (
            <div
              className="mt-1 space-y-2 rounded-md border dark:border-transparent bg-bt-background-light dark:bg-gray-700 p-4 shadow-lg"
              style={{ width: '360px' }}
            >
              <div className="flex max-w-md items-end gap-3">
                <TextInput
                  id="promo-code"
                  aria-invalid={Boolean(error)}
                  label="Promo Code"
                  value={inputValue}
                  onChange={handleChange}
                  placeholder="Enter promo code"
                />
                <Button
                  variant="secondary"
                  onClick={() => applyPromo({ code: inputValue, courseIds }, { onSuccess: () => close() })}
                >
                  Apply
                </Button>
              </div>
              {error ? (
                <Text As="p" variant="bodySmallBold" className="mt-1 text-red-600">
                  {error}
                </Text>
              ) : null}
            </div>
          )}
        </Popover.Panel>
      </Popover>
    );
  };

  const PromoCodeInput = promoInputBuilder(
    <Popover.Button
      as={Button}
      variant="background"
      size="extraSmall"
      className="rounded-full shadow-none drop-shadow-none"
      icon={<TagIcon />}
    >
      <Text variant="bodySmallBold" className="text-gray-800">
        Apply Promo
      </Text>
    </Popover.Button>
  );

  const PromoCodeLinkInput = promoInputBuilder(
    <Popover.Button
      as={'a'}
      className="text-bt-teal dark:text-bt-teal-light hover:underline cursor-pointer text-bodySmall"
    >
      Have a promo code?
    </Popover.Button>
  );

  return {
    PromoCodeInput,
    PromoCodeDescription,
    PromoCodeIcon,
    PromoCodeLinkInput,
    isPromoCodeApplied: Boolean(codeData),
    appliedCode: codeData,
  };
};

export default usePromoCodeInput;
