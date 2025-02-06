import { GlobeAltIcon } from '@heroicons/react/outline';
import { FC, HTMLAttributes, ReactElement } from 'react';
import FacebookIcon from './icons/FacebookIcon';
import InstagramIcon from './icons/InstagramIcon';
import PinterestIcon from './icons/PinterestIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import TikTokIcon from './icons/TikTokIcon';
import YouTubeIcon from './icons/YouTubeIcon';

export const socialNav = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCWFkHS5sxINqWeW5t6_bymQ',
    icon: (props: HTMLAttributes<SVGElement>) => <YouTubeIcon {...props} />,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/bright.trip/',
    icon: (props: HTMLAttributes<SVGElement>) => <InstagramIcon {...props} />,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@bright.trip',
    icon: (props: HTMLAttributes<SVGElement>) => <TikTokIcon {...props} />,
  },
  {
    name: 'Pinterest',
    href: 'https://www.pinterest.com/brighttriptravel/',
    icon: (props: HTMLAttributes<SVGElement>) => <PinterestIcon {...props} />,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/BrightTripTeam',
    icon: (props: HTMLAttributes<SVGElement>) => <FacebookIcon {...props} />,
  },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/user/mj4cv6vcqakzgr5ad2hw7nm2o',
    icon: (props: HTMLAttributes<SVGElement>) => <SpotifyIcon {...props} />,
  },
];

export const DEFAULT_SOCIAL_LINK_ICON = (props: HTMLAttributes<SVGElement>) => <GlobeAltIcon {...props} />;

export interface SocialLink {
  name: string;
  href: string;
  icon: (props: HTMLAttributes<SVGElement>) => ReactElement;
}

const SocialLinks: FC<{
  links?: SocialLink[];
  className?: string;
}> = ({
  links = socialNav,
  className = 'text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200',
}) => (
  <div className="flex justify-center space-x-6">
    {links.map((item) => (
      <a key={item.name} href={item.href} className={className} target="_blank" rel="noopener noreferrer">
        <span className="sr-only">{item.name}</span>
        {item.icon && <item.icon className="h-6 w-6" aria-hidden="true" />}
      </a>
    ))}
  </div>
);

export default SocialLinks;
