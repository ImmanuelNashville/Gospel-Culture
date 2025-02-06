'use client';

import React, { ForwardedRef, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Entry } from 'contentful';
import { ContentfulMuxVideoFields } from '../models/contentful';
import { EnrollmentType } from '../utils/enrollment';
import MuxPlayer from '@mux/mux-player-react/lazy';
import type { MuxPlayerProps } from '@mux/mux-player-react';
import type MuxPlayerElement from '@mux/mux-player';
import composeRefs from '@seznam/compose-react-refs';
import { MuxToken } from '../utils/tokens';

const VIDEO_PROGRESS_TRACK_INTERVAL_SECONDS = 10;

interface MuxMetadataFields {
  videoSeries?: string;
  videoProducer?: string;
  enrollmentType?: EnrollmentType;
}
interface VideoPlayerProps extends MuxPlayerProps {
  muxVideo: Entry<ContentfulMuxVideoFields>;
  isVisible?: boolean;
  muxToken: MuxToken;
  onProgressUpdate?: (percentage: number, videoId: string) => void;
  progress?: number;
  duration?: number;
  dataFields?: MuxMetadataFields;
}

export const VideoPlayer = React.forwardRef(function VideoPlayer(
  {
    muxVideo,
    isVisible = false,
    muxToken,
    onProgressUpdate,
    progress = 0,
    duration,
    dataFields,
    ...videoElementProps
  }: VideoPlayerProps,
  externalRef: ForwardedRef<MuxPlayerElement>
) {
  const {
    fields: { video, internalName },
  } = muxVideo;
  const { signedPlaybackId } = video ?? {};
  const { user } = useUser();
  const videoRef = useRef<MuxPlayerElement>(null);
  const trackedCurrentSecond = useRef(0);

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
  }, [isVisible]);

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

  // this is so if someone is more than 85% of the way through a video and they click it again, we'll just restart it.
  // otherwise someone would get stuck in a situation where they click a video and it just only plays the last 10 seconds or so
  // unless they manually move the playhead back to the beginning since it was picking up from where they "left off"
  const startTime = progress / (duration ?? 1) > 0.85 ? 0 : progress;

  return (
    <MuxPlayer
      ref={composeRefs(externalRef, videoRef)}
      style={{ width: '100%', lineHeight: 0, aspectRatio: '16/9', ...videoElementProps.style }}
      playbackId={signedPlaybackId}
      defaultHiddenCaptions
      streamType="on-demand"
      metadata={{
        player_init_time: Date.now(),
        player_name: 'Mux Player',
        player_version: '0.1.0-beta.26',
        viewer_user_id: user?.sub ?? 'logged-out-user',
        page_url: typeof window !== 'undefined' ? window.location.pathname : 'server',
        video_playback_id: signedPlaybackId,
        video_title: internalName,
        video_series: dataFields?.videoSeries,
        video_producer: dataFields?.videoProducer,
        custom_1: dataFields?.videoProducer,
        custom_2: dataFields?.enrollmentType,
      }}
      tokens={{
        playback: muxToken.video,
        thumbnail: muxToken.thumbnail,
        storyboard: muxToken.storyboard,
      }}
      startTime={startTime}
      {...videoElementProps}
      onTimeUpdate={onProgressUpdate ? trackTenSecondIntervals : undefined}
      autoPlay={videoElementProps.autoPlay ? 'auto' : false}
    />
  );
});

export default VideoPlayer;
