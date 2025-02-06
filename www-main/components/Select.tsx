/* 

This is mostly copy/pasted from Tailwind UI
https://tailwindui.com/components/application-ui/forms/select-menus (Simple Custom)

*/

import { FC, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import InputLabel from './InputLabel';

export interface SelectOption {
  id: string;
  name: string;
  disabled?: boolean;
  numberOfResults?: number;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  selected: SelectOption;
  setSelected: (option: SelectOption) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Select: FC<SelectProps> = ({ label, options, selected, setSelected }) => {
  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label as={InputLabel} id={label}>
            {label}
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="bg-bt-background-light focus:outline-none focus:ring-current focus:border-current sm:text-sm relative h-10 w-full cursor-default rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-left focus:ring-1 dark:border-gray-600 dark:bg-gray-700">
              <span className="block dark:text-white whitespace-nowrap truncate">{selected?.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <SelectorIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="text-base focus:outline-none sm:text-sm absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-bt-background-light py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      classNames(
                        option.disabled
                          ? 'text-gray-500 dark:text-gray-400'
                          : active
                          ? 'bg-gray-100 dark:bg-gray-600 dark:text-white'
                          : 'text-gray-900 dark:text-gray-100',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={option}
                    disabled={option.disabled ?? false}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-semibold text-bt-teal dark:text-bt-teal-light' : 'font-normal',
                            'block'
                          )}
                        >
                          {option.name}
                          {option.numberOfResults ? (
                            <span className="ml-2 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 px-1.5 py-0.5 rounded-full text-xs font-bold">
                              {option.numberOfResults}
                            </span>
                          ) : null}
                        </span>

                        {selected ? (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-bt-teal dark:text-bt-teal-light">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default Select;
