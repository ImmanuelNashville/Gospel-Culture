'use client';

import composeRefs from '@seznam/compose-react-refs';
import Hls from 'hls.js';
import mux from 'mux-embed';
import React, { ForwardedRef, useEffect, useRef, VideoHTMLAttributes } from 'react';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Entry } from 'contentful';
import { ContentfulMuxVideoFields } from '../models/contentful';
import { EnrollmentType } from '../utils/enrollment';

const VIDEO_PROGRESS_TRACK_INTERVAL_SECONDS = 10;

interface MuxMetadataFields {
  videoSeries?: string;
  videoProducer?: string;
  enrollmentType?: EnrollmentType;
}
interface VideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  muxVideo: Entry<ContentfulMuxVideoFields>;
  isVisible?: boolean;
  muxToken: string;
  muxPosterToken: string;
  onVideoEnded?: () => void;
  onProgressUpdate?: (percentage: number, videoId: string) => void;
  progress?: number;
  duration?: number;
  dataFields?: MuxMetadataFields;
}

export const LegacyVideoPlayer = React.forwardRef(function VideoPlayer(
  {
    muxVideo,
    isVisible = false,
    onVideoEnded,
    muxToken,
    muxPosterToken,
    onProgressUpdate,
    progress = 0,
    duration,
    dataFields,
    ...videoElementProps
  }: VideoPlayerProps,
  externalRef: ForwardedRef<HTMLVideoElement>
) {
  const {
    fields: { video, internalName, thumbnail },
  } = muxVideo;
  const { signedPlaybackId } = video ?? {};
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackedCurrentSecond = useRef(0);
  const src = `https://stream.mux.com/${signedPlaybackId}.m3u8?token=${muxToken}`;

  useEffect(() => {
    let hls: Hls;
    if (videoRef.current) {
      const video = videoRef.current;
      const initTime = Date.now();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Some browers (safari and ie edge) support HLS natively
        video.src = src;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        console.error("This is a legacy browser that doesn't support MSE");
      }

      mux.monitor(video, {
        debug: false,
        // @ts-expect-error hls will actually be defined, but typescript doesn't run the code so it doesn't know
        hlsjs: hls,
        Hls,
        data: {
          env_key: process.env.NEXT_PUBLIC_MUX_MEDIA_ENV_KEY,

          // Site Data
          viewer_user_id: user?.sub ?? 'logged-out-user',
          page_url: typeof window === 'undefined' ? 'server' : window.location.pathname,

          // Player Data
          player_name: 'HTML5 Player',
          player_init_time: initTime,

          // Video Data
          video_playback_id: signedPlaybackId,
          video_title: internalName,
          video_series: dataFields?.videoSeries,
          video_producer: dataFields?.videoProducer,
          custom_1: dataFields?.videoProducer,
          custom_2: dataFields?.enrollmentType,
        },
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [
    videoRef,
    src,
    signedPlaybackId,
    user,
    internalName,
    dataFields?.videoSeries,
    dataFields?.enrollmentType,
    dataFields?.videoProducer,
  ]);

  useEffect(() => {
    // Set the initial starting point for the video to the user's last synced progress
    if (videoRef.current) {
      if (progress && duration && progress / duration < 0.9) {
        videoRef.current.currentTime = progress;
      }
    }
  }, [progress, duration]);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        if (!videoRef.current.ended) {
          videoRef.current.play();
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible, videoRef]);

  useEffect(() => {
    if (onVideoEnded) {
      videoRef.current?.addEventListener('ended', onVideoEnded);
    }

    return () => {
      if (onVideoEnded) {
        removeEventListener('ended', onVideoEnded);
      }
    };
  }, [videoRef.current?.ended, onVideoEnded]);

  useEffect(() => {
    const videoElement = videoRef.current;

    const trackTenSecondIntervals = (e: Event) => {
      const currentSecond = Math.floor((e.target as HTMLMediaElement).currentTime);
      if (
        currentSecond > 0 &&
        currentSecond % VIDEO_PROGRESS_TRACK_INTERVAL_SECONDS === 0 &&
        trackedCurrentSecond.current !== currentSecond
      ) {
        onProgressUpdate?.((e.target as HTMLMediaElement).currentTime, muxVideo.sys.id);
        trackedCurrentSecond.current = currentSecond;
      }
    };

    if (onProgressUpdate) {
      videoElement?.addEventListener('timeupdate', trackTenSecondIntervals);
    }

    return () => {
      if (onProgressUpdate) {
        videoElement?.removeEventListener('timeupdate', trackTenSecondIntervals);
      }
    };
  }, [muxVideo.sys.id, onProgressUpdate]);

  const posterURL = `https:${
    thumbnail?.fields.file.url ?? `//image.mux.com/${signedPlaybackId}/thumbnail.jpg?token=${muxPosterToken}`
  }`;

  return (
    <video
      controls
      {...videoElementProps}
      ref={composeRefs(externalRef, videoRef)}
      style={{ width: '100%' }}
      poster={posterURL}
    />
  );
});

export default LegacyVideoPlayer;
