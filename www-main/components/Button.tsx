import React, { ButtonHTMLAttributes } from 'react';

type ButtonSize = 'extraExtraSmall' | 'extraSmall' | 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'background' | 'disabled' | 'muted' | 'glassPrimary' | 'glassSecondary';

const variantStyles: { [key in ButtonVariant]: string } = {
  primary:
    'bg-bt-orange text-white hover:bg-bt-orange-dark hover:scale-[102%] transition duration-150 hover:shadow-sm focus:bg-bt-orange-dark',
  secondary: 'bg-bt-yellow text-white hover:bg-bt-teal-dark focus:bg-bt-teal-dark',
  background:
    'bg-white text-black hover:bg-gray-50 dark:bg-white/20 dark:text-white dark:backdrop-blur-xl dark:hover:bg-gray-600 border border-gray-200 dark:border-transparent',
  disabled: 'bg-gray-300 text-white dark:bg-gray-500 dark:text-gray-800 cursor-not-allowed',
  muted:
    'bg-bt-teal-ultraLight/30 text-bt-teal-dark hover:bg-bt-teal-ultraLight/50 dark:text-bt-teal-ultraLight dark:hover:bg-bt-teal-ultraLight/20',
  glassPrimary: 'bg-bt-teal/70 text-white hover:bg-bt-teal/40 rounded-xl whitespace-nowrap backdrop-blur-xl',
  glassSecondary: 'bg-white/10 text-white hover:bg-white/5 rounded-xl whitespace-nowrap backdrop-blur-xl',
};

const sizeStyles: { [key in ButtonSize]: string } = {
  extraExtraSmall: 'text-[12px] py-1.5 px-2.5 font-bold',
  extraSmall: 'text-bodySmall py-1.5 px-3',
  small: 'text-body py-2 px-4',
  medium: 'text-subtitle1 py-2.5 px-5',
  large: 'text-headline6 font-bold py-3 px-6',
};

const iconSizes: { [key in ButtonSize]: string } = {
  extraExtraSmall: 'w-4 h-4 mr-0.5',
  extraSmall: 'w-4 h-4 mr-1',
  small: 'w-5 h-5 mr-1',
  medium: 'w-6 h-6 mr-1.5',
  large: 'w-7 h-7 mr-2',
};

interface CustomButtonProps {
  variant?: ButtonVariant;
  className?: string;
  size?: ButtonSize;
  disable?: boolean;
  icon?: React.ReactNode;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CustomButtonProps;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  size = 'small',
  disable = false,
  icon,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`${className} ${disable ? variantStyles.disabled : variantStyles[variant]} ${
        icon && !children ? 'h-10 w-10' : `${sizeStyles[size]}`
      }`}
      disabled={disable}
    >
      {icon && children ? (
        <div className="flex items-center justify-center relative">
          <span className={`${iconSizes[size]}`}>{icon}</span>
          {children}
        </div>
      ) : icon ? (
        <div className="flex items-center justify-center">
          <span className="h-6 w-6">{icon}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
