export interface ThumbnailOptions extends Record<string, string | number | undefined | boolean> {
  // default values in comments
  time?: number; // 0
  width?: number; // original file width
  height?: number; // original file height
  rotate?: 90 | 180 | 270; // 0 (rotates clockwise)
  fit_mode?: 'preserve' | 'stretch' | 'crop' | 'smartcrop' | 'pad'; // preserve
  flip_v?: boolean; // false
  flip_h?: boolean; //false
}

interface VideoThumbnailProps {
  muxToken: string;
  playbackId: string;
  options?: ThumbnailOptions;
  alt: string;
}

export default function VideoThumbnail({ playbackId, muxToken }: VideoThumbnailProps) {
  return (
    <div
      className="w-full bg-gray-200 bg-cover"
      style={{ backgroundImage: `url("https://image.mux.com/${playbackId}/thumbnail.jpg?token=${muxToken}")` }}
    />
  );
}
