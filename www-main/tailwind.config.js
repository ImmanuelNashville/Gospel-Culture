const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      ...colors,
      gray: colors.gray,
    },
    fontFamily: {
      bodycopy: ['Bookmania', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      fontSize: {
        caption: ['14px', { lineHeight: '19.6px', letterSpacing: '0.02em' }],
        button: ['14px', { lineHeight: '17px', letterSpacing: '0.02em' }],
        bodySmall: ['14px', { lineHeight: '22.4px' }],
        body: ['16px', { lineHeight: '25.6px' }],
        subtitle2: ['16px', { lineHeight: '19px', letterSpacing: '0.02em' }],
        subtitle1: ['18px', { lineHeight: '22px', letterSpacing: '0.005em' }],
        headline6: ['24px', { lineHeight: '29px' }],
        headline5: ['32px', { lineHeight: '38px' }],
        headline4: ['40px', { lineHeight: '48px' }],
        headline3: ['48px', { lineHeight: '58px' }],
        headline2: ['56px', { lineHeight: '67px' }],
        headline1: ['64px', { lineHeight: '77px' }],
      },
      colors: {
        'bt-off-white': {
          DEFAULT: '#f8f8f8',
        },
        'bt-orange': {
          darker: '#CF5F16',
          DEFAULT: '#e86B19',
          light: '#ECA175',
          ultraLight: '#F1BF93',
        },
        'bt-teal': {
          dark: '#085966',
          DEFAULT: '#0a7687',
          light: '#6CA8B2',
          ultraLight: '#98C3CA',
        },
        'bt-green': {
          DEFAULT: '#07503d',
          light: '#6A9186',
          ultraLight: '#97B4AC',
        },
        'bt-yellow': {
          DEFAULT: '#B09352',
          light: '#B09352',
          ultraLight: '#B09352',
        },
        'bt-lightBlue': {
          DEFAULT: '#7ddaea',
          light: '#ACE4ED',
          ultraLight: '#C6EBF2',
        },
        'bt-background': {
          light: '#FEFEFE',
        },
      },
      fontFamily: {
        sans: ['Bookmania', ...defaultTheme.fontFamily.sans],
      },
      width: {
        'small-card': '200px',
        card: '310px',
      },
      margin: {
        nav: '-74px',
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms')],
};
