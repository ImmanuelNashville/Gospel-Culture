import { ChangeEventHandler, FC, InputHTMLAttributes } from 'react';
import InputLabel from './InputLabel';

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  className?: string;
}

const TextArea: FC<TextAreaProps> = ({ label, id, value, onChange, className, ...otherProps }) => {
  return (
    <div className="w-full">
      <InputLabel id={id}>{label}</InputLabel>
      <textarea
        {...otherProps}
        value={value}
        onChange={onChange}
        id={id}
        autoComplete="off"
        className={`focus:outline-none sm:text-sm relative mt-1 h-60 w-full cursor-default rounded-lg border border-gray-300 bg-bt-background-light py-2 pl-3 pr-10 text-left text-black shadow-sm focus:border-bt-teal focus:ring-1 focus:ring-bt-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className}`}
      />
    </div>
  );
};

export default TextArea;
