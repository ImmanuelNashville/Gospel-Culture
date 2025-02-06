'use client';

import Image from 'next/image';
import AvatarPlaceholder from 'components/AvatarPlaceholder';
import { useBrightTripUser } from 'hooks/useBrightTripUser';
import { withAWSPathPrefix } from 'utils';

export default function NavProfile() {
  const { user } = useBrightTripUser();

  if (user) {
    const profileImageUrl = user.imageUrl?.startsWith('http') ? user.imageUrl : withAWSPathPrefix(user.imageUrl);
    return <Image src={profileImageUrl} className="rounded-full" alt="" width="32" height="32" unoptimized />;
  }

  return <AvatarPlaceholder />;
}
