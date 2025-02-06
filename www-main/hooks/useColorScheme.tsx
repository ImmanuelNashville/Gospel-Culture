import { MoonIcon, SunIcon } from '@heroicons/react/outline';
import { useEffect, useState, ReactNode } from 'react';
import { useCookies } from 'react-cookie';

export function useColorScheme() {
  const [cookies, setCookie] = useCookies(['bt-theme']);
  const previouslySelectedDarkMode = cookies['bt-theme'] === 'dark';
  const hasNotSpecifiedTheme = !('bt-theme' in cookies);
  const deviceIsInDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDarkMode = previouslySelectedDarkMode || (hasNotSpecifiedTheme && deviceIsInDarkMode);
  const [theme, setTheme] = useState(() => (shouldBeDarkMode ? 'dark' : 'light'));
  const [themeIcon, setThemeIcon] = useState<ReactNode>(<MoonIcon className="w-6 h-6" />);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setThemeIcon(<SunIcon className="w-6 h-6" />);
    } else {
      document.documentElement.classList.remove('dark');
      setThemeIcon(<MoonIcon className="w-6 h-6" />);
    }
    setCookie('bt-theme', theme);
  }, [theme, setCookie]);

  const toggleTheme = () => (theme === 'dark' ? setTheme('light') : setTheme('dark'));

  return { theme, themeIcon, toggleTheme };
}
