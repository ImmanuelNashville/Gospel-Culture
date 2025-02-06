import React from 'react';
import { ChangeEventHandler, InputHTMLAttributes } from 'react';
import InputLabel from './InputLabel';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, id, value, onChange, ...otherProps },
  ref
) {
  return (
    <div className="w-full">
      <InputLabel id={id}>{label}</InputLabel>
      <input
        type="text"
        {...otherProps}
        value={value}
        onChange={onChange}
        id={id}
        autoComplete="off"
        className="font-bodycopy focus:outline-none sm:text-sm relative mt-1 h-10 w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-black shadow-sm focus:border-bt-teal focus:ring-1 focus:ring-bt-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        ref={ref}
      />
    </div>
  );
});

export default TextInput;
