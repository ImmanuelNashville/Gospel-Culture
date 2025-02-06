import styles from '../styles/Text.module.css';

type TextVariant =
  | 'headline1'
  | 'headline2'
  | 'headline3'
  | 'headline4'
  | 'headline5'
  | 'headline6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body'
  | 'bodyBold'
  | 'bodySmall'
  | 'bodySmallBold'
  | 'button'
  | 'caption'
  | 'sectionTitleUnderline'
  | 'sectionTitleLeftBorder'
  | 'sectionTitleLeftBorderCompact';

type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'dd' | 'dt';

const variantStyles: Record<TextVariant, string> = {
  headline1: 'text-headline1 font-bold',
  headline2: 'text-headline2 font-bold',
  headline3: 'text-headline3 font-bold',
  headline4: 'text-headline4 font-bold',
  headline5: 'text-headline5 font-bold',
  headline6: 'text-headline6 font-bold',
  subtitle1: 'text-subtitle1 font-bold',
  subtitle2: 'text-subtitle2 uppercase',
  body: 'text-body',
  bodyBold: 'text-body font-bold',
  bodySmall: 'text-bodySmall',
  bodySmallBold: 'text-bodySmall font-bold',
  button: 'text-button uppercase',
  caption: 'text-caption',
  sectionTitleUnderline: 'text-headline5 font-bold p-4 inline-block min-w-max filter',
  sectionTitleLeftBorder: 'block text-headline5 font-bold filter pl-2',
  sectionTitleLeftBorderCompact: 'block text-headline6 font-bold filter pl-2',
};

export interface TextProps {
  variant: TextVariant;
  As?: TextElement;
  className?: string;
  alwaysWhite?: boolean;
  children?: React.ReactNode;
}

const Text = ({ variant, As = 'span', className = '', alwaysWhite = false, children }: TextProps) => {
  const withLeftAccent = variant === 'sectionTitleLeftBorder';
  const withLeftAccentCompact = variant === 'sectionTitleLeftBorderCompact';
  const withBottomAccent = variant === 'sectionTitleUnderline';

  return (
    <As
      className={`${className} ${variantStyles[variant]} ${alwaysWhite ? 'text-white' : 'text-black dark:text-white'} ${
        withLeftAccent ? styles.leftAccent : ''
      } ${withLeftAccentCompact ? styles.leftAccentCompact : ''} ${withBottomAccent ? styles.bottomAccent : ''}`}
    >
      {children}
    </As>
  );
};

export default Text;
