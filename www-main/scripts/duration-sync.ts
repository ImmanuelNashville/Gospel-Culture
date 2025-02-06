import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface MuxAsset {
  upload_id: string;
  tracks: any[];
  status: string;
  playback_ids: any[];
  passthrough: string;
  mp4_support: string;
  max_stored_resolution: string;
  max_stored_frame_rate: number;
  master_access: string;
  id: string;
  duration: number;
  created_at: string;
  aspect_ratio: string;
}

type AssetMap = Record<string, { duration: number }>;

type DurationsResponse = {
  count: number;
  assets: AssetMap;
};

const PAGE_SIZE = 100;

async function getDurations() {
  let page = 0;
  let shouldKeepFetching = true;
  const assets: AssetMap = {};

  while (shouldKeepFetching) {
    console.log(`Fetching page ${page}`);
    const response = await fetch(`https://api.mux.com/video/v1/assets?page=${page}&limit=${PAGE_SIZE}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.MUX_ACCESS_TOKEN_ID}:${process.env.MUX_SECRET_KEY}`
        ).toString('base64')}`,
      },
    });
    const muxAssets = (await response.json()) as { data: MuxAsset[] };
    muxAssets.data.forEach((asset) => {
      assets[asset.id] = { duration: asset.duration };
    });
    page += 1;
    if (muxAssets.data.length < PAGE_SIZE) {
      console.log('detected last page, stopping...');
      shouldKeepFetching = false;
    } else {
      console.log(`there were ${muxAssets.data.length} assets, continuing...`);
    }
  }

  return { assets, count: Object.keys(assets).length };
}

function saveDurationsFile(meta: DurationsResponse) {
  console.log(`Saving data to ${process.cwd()}/data/durations.json`);

  const filePath = path.join(process.cwd(), '/data/video-meta.json');

  if (!fs.existsSync(filePath)) {
    console.log('creating file...');
    fs.mkdirSync(path.join(process.cwd(), '/data'));
  }

  fs.writeFileSync(filePath, JSON.stringify(meta, null, 4));
  console.log('DONE ✅');
}

getDurations().then((durations) => saveDurationsFile(durations));
