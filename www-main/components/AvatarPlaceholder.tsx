import { FC } from 'react';

interface AvatarPlaceholderProps {
    size?: 'compact' | 'normal' | 'large';
    widthHeight?: string;
}

const AvatarPlaceholder: FC<AvatarPlaceholderProps> = ({ size = 'normal', widthHeight }) => {
    const sizes = {
        compact: 'h-6 w-6',
        normal: 'h-8 w-8',
        large: 'h-60 w-60',
    };
    return (
        <span
            className={`inline-block ${
                widthHeight ? widthHeight : sizes[size]
            } overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600`}
        >
            <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </span>
    );
};

export default AvatarPlaceholder;
