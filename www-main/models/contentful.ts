import { Entry } from 'contentful';
import { Document } from '@contentful/rich-text-types';

export type Course = Entry<ContentfulCourseFields>;
export type Creator = Entry<ContentfulCreatorFields>;
export type FAQ = Entry<ContentfulFAQFields>;
export type Playlist = Entry<ContentfulPlaylistFields>;

export interface ContentfulCourseFields {
  title: string;
  slug: string;
  category: Entry<ContentfulCourseCategoryFields>[];
  oneLineDescription?: string;
  description?: string;
  creator?: Entry<ContentfulCreatorFields | ContentfulCreatorTeamFields>;
  tileThumbnail?: Entry<ContentfulImageFields>;
  hero?: Entry<ContentfulImageFields>;
  heroVideo?: Entry<ContentfulMuxVideoFields>;
  chapters?: Entry<ContentfulChapterFields>[];
  price?: number;
  trailer?: Entry<ContentfulMuxVideoFields>;
  trailerMux?: MuxVideoFromContentful;
  samples?: Entry<ContentfulMuxVideoFields>[];
  resources?: Entry<ContentfulFileFields>[];
  whatYouWillLearn?: Document;
  courseMap?: string;
  products?: Entry<ContentfulProductFields>[];
  courseResources?: Entry<ContentfulCourseResourceFields>[];
  launchDate?: string;
  promoText?: string;
}

interface ContentfulCourseCategoryFields {
  name: string;
  slug: string;
}

export interface ContentfulCreatorFields {
  name: string;
  slug: string;
  bio?: string;
  profilePhoto?: Entry<ContentfulImageFields>;
  hero?: Entry<ContentfulImageFields>;
  oneLineBio?: string;
  socialLinks?: string[];
  featureImage?: Entry<ContentfulImageFields>;
  meetCreatorImage?: Entry<ContentfulImageFields>;
}

export interface ContentfulCreatorTeamFields extends ContentfulCreatorFields {
  members: Entry<ContentfulCreatorFields>[];
}

export interface ContentfulImageFields {
  title: string;
  description?: string;
  file: {
    contentType: string;
    details: {
      size: number;
      image: {
        height: number;
        width: number;
      };
    };
    fileName: string;
    url: string;
  };
}

export interface ContentfulFileFields {
  title: string;
  description?: string;
  file: {
    contentType: string;
    details: {
      size: number;
    };
    fileName: string;
    url: string;
  };
}

export interface ContentfulChapterFields {
  internalName: string;
  title: string;
  description?: string;
  lessons?: Entry<ContentfulLessonFields>[];
  thumbnail?: Entry<ContentfulImageFields>;
}

export interface ContentfulLessonFields {
  internalName: string;
  title: string;
  description?: string;
  video?: Entry<ContentfulMuxVideoFields>;
  relatedItems?: Entry<
    ContentfulCourseFields | ContentfulCreatorFields | ContentfulCreatorTeamFields | ContentfulProductFields
  >[];
}

export interface ContentfulMuxVideoFields {
  internalName: string;
  video?: MuxVideoFromContentful;
  displayName?: string;
  thumbnail?: Entry<ContentfulImageFields>;
  thumbnailTimecode?: number;
  creator?: Entry<ContentfulCreatorFields | ContentfulCreatorTeamFields>;
}

interface MuxVideoFromContentful {
  uploadId: string;
  assetId: string;
  signedPlaybackId: string;
  ready: boolean;
  ratio: string;
  audioOnly?: boolean;
  captions?: {
    id: string;
    language_code: string;
    name: string;
    status: string;
    text_source: string;
    text_type: string;
    type: string;
  }[];
  created_at?: number;
  duration?: number;
  max_stored_frame_rate?: number;
  max_stored_resolution?: number;
  version?: number;
}

export interface ContentfulFAQFields {
  question: string;
  answer: Document;
}

export interface ContentfulReviewFields {
  userId: string;
  body: string;
  rating: number;
}

export interface ContentfulProductFields {
  internalName: string;
  name: string;
  url: string;
  image?: Entry<ContentfulImageFields>;
  courses?: Entry<ContentfulCourseFields>[];
  owner?: Entry<ContentfulCreatorFields>;
}

export interface RichTextPageFields {
  internalName: string;
  body: Document;
}

export type ContentfulCourseResourceFieldsType = 'PDF' | 'Generic Link' | 'Course Map' | 'Google Sheet';

export interface ContentfulCourseResourceFields {
  internalName: string;
  displayName: string;
  type: ContentfulCourseResourceFieldsType;
  url?: string;
  uploadedFile?: Entry<ContentfulFileFields>;
}

export type ContentfulPlaylistFields = Pick<ContentfulCourseFields, 'title' | 'tileThumbnail' | 'slug' | 'chapters'>;

export interface ContentfulSingleVideoPageFields {
  internalName: string;
  title: string;
  slug: string;
  video: Entry<ContentfulMuxVideoFields>;
  accessType?: 'free' | 'subscription';
  description?: string;
  relatedItemsLabel?: string;
  relatedItems?: (Course | Playlist)[];
  showInSearch: boolean;
}

export type ContentfulCourseBundleFields = {
  title: string;
  slug: string;
  shortDescription: string;
  heroImage: Entry<ContentfulImageFields>;
  heroVideo?: Entry<ContentfulMuxVideoFields>;
  courses: Course[];
};

export type CourseBundle = Entry<ContentfulCourseBundleFields>;

export interface ContentfulArticleFields {
  internalTitle: string;
  title: string;
  subtitle?: string;
  datePublished?: string; // ISO date string or Date object depending on Contentful settings
  contributor?: Entry<ContentfulCreatorFields>; // If it's a reference to the Creator
  sourceLocation?: Document; // If this is a rich text field
  images?: Entry<ContentfulImageFields>[]; // Handling multiple images
  articleText: Document; // Assuming this is long text (rich text)
}

// You can also define the Article entry type as follows:
export type ContentfulArticle = Entry<ContentfulArticleFields>;

export interface ContentfulContributorFields {
  name: string;
  entryTitle: string;
  slug: string;
  bio?: string;
  profilePhoto?: Entry<ContentfulImageFields>;
  hero?: Entry<ContentfulImageFields>;
  oneLineBio?: string;
  socialLinks?: Document; // Rich Text from Contentful
}


// models/contentful.ts

export interface ContentfulPodcastFields {
  title: string;
  subtitle?: string; // Make it optional if not every podcast has a subtitle
  slug: string;
  publishDate: string;
  duration: string;
  podcastAudio: {
    file: {
      url: string;
      contentType: string;
    };
  };
  coverImage: Entry<ContentfulImageFields>;
  episodeNotes: Document; // If you have rich text
  subscribeLink: string;
  podcastCover: Entry<ContentfulImageFields>; // Add podcastCover here
}

export type ContentfulPodcast = Entry<ContentfulPodcastFields>;

// Define ContentfulSermonFields interface
export interface ContentfulSermonFields {
  title: string;
  shortText?: string;
  slug: string; // Assuming slug holds the video URL
  reference?: string;
  description: Document;
  relatedItemsLabel?: string;
  relatedItems?: Array<Entry<ContentfulSermonFields>>; // Related sermon entries
  customThumbnail?: Entry<ContentfulImageFields>;
}

// Export ContentfulSermon type
export type ContentfulSermon = Entry<ContentfulSermonFields>; // Ensure this type is exported

// Other content types (optional)
export interface ContentfulImageFields {
  title: string;
  description?: string;
  file: {
    contentType: string;
    details: {
      size: number;
      image: {
        height: number;
        width: number;
      };
    };
    fileName: string;
    url: string;
  };
}



