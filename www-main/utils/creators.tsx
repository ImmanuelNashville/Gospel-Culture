import { Entry } from 'contentful';
import { ContentfulCreatorFields } from '../models/contentful';
import { HTMLAttributes, ReactElement } from 'react';
import { SocialLink } from '../components/SocialLinks';
import { GlobeAltIcon } from '@heroicons/react/outline';
import YouTubeIcon from 'components/icons/YouTubeIcon';
import InstagramIcon from 'components/icons/InstagramIcon';
import TikTokIcon from 'components/icons/TikTokIcon';
import PinterestIcon from 'components/icons/PinterestIcon';
import FacebookIcon from 'components/icons/FacebookIcon';
import SpotifyIcon from 'components/icons/SpotifyIcon';
import TwitterIcon from 'components/icons/TwitterIcon';

const nameToIconMap = {
  youtube: (props: HTMLAttributes<HTMLOrSVGElement>) => <YouTubeIcon {...props} />,
  instagram: (props: HTMLAttributes<HTMLOrSVGElement>) => <InstagramIcon {...props} />,
  tiktok: (props: HTMLAttributes<HTMLOrSVGElement>) => <TikTokIcon {...props} />,
  pinterest: (props: HTMLAttributes<HTMLOrSVGElement>) => <PinterestIcon {...props} />,
  facebook: (props: HTMLAttributes<HTMLOrSVGElement>) => <FacebookIcon {...props} />,
  spotify: (props: HTMLAttributes<HTMLOrSVGElement>) => <SpotifyIcon {...props} />,
  twitter: (props: HTMLAttributes<HTMLOrSVGElement>) => <TwitterIcon {...props} />,
} as Record<string, (props: HTMLAttributes<HTMLOrSVGElement>) => ReactElement>;

const getSocialNameFromUrl = (url: string) => {
  const names = Object.keys(nameToIconMap);
  return names.find((name) => url.includes(name));
};

export const buildSocialLinks = (creator: Entry<ContentfulCreatorFields>) => {
  const socialUrls = creator.fields.socialLinks;

  if (socialUrls?.length) {
    return socialUrls.reduce((links, href) => {
      const networkName = getSocialNameFromUrl(href);
      const link = {
        href,
        name: networkName ?? 'website',
        icon:
          nameToIconMap[networkName ?? ''] ??
          ((props: HTMLAttributes<HTMLOrSVGElement>) => <GlobeAltIcon {...props} />),
      };
      links.push(link);
      return links;
    }, [] as SocialLink[]);
  }

  return [];
};
