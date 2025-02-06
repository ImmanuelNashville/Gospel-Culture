import Image from 'next/image';
import zionAdgImage from '../public/images/zion-adg.png';
import * as mpClient from '../mixpanel/client';
import Button from './Button';

export default function ZionAdgCalloutSection({ location }: { location: string }) {
  const trackZionAdgClick = () => {
    const data: mpClient.ExternalTrafficSentData = {
      type: 'Partner',
      partner: 'ADG',
      product: 'Zion Prints',
      location,
    };
    mpClient.track(mpClient.Event.ExternalTrafficSent, data);
  };

  return (
    <div className="flex flex-col md:flex-row mx-auto shadow-md rounded-xl md:rounded-3xl overflow-hidden max-h-min bg-black/40">
      <div className="relative w-full h-40 md:h-auto overflow-hidden">
        <Image
          src={zionAdgImage}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 800px"
          className="object-cover bg-bottom"
        />
      </div>
      <div className="flex flex-col items-center md:items-start w-full bg-gradient-to-r from-bt-green/80 to-bt-lightBlue/20 p-8">
        <h2 className="text-white/90 text-xl md:text-3xl font-bold mb-2 leading-tight">
          Get 20% Off Custom ZION Artwork
        </h2>
        <p className="text-bodySmall md:text-body text-white/70 max-w-lg font-bodycopy leading-relaxed">
          Our friends at Anderson Design Group created beautiful artwork that inspired this course. Get your hands on
          amazing, hand-crafted illustrative products today!
        </p>

        <a href="https://www.andersondesigngroupstore.com/?_ga=2.178147938.651810645.1679412604-373879508.1674248881%26_gac%3D1.221423210.1677779953.CjwKCAiAr4GgBhBFEiwAgwORrVDzCKdp-D5cq4Inpz3hRGRzoaW6wIdXJ0c4rfIoFybKVETfgXOD5BoCttAQAvD_BwE&aff=3">
          <Button variant="primary" size="small" className="mt-6 font-bold px-7" onClick={trackZionAdgClick}>
            Shop Zion Artwork
          </Button>
        </a>
      </div>
    </div>
  );
}
