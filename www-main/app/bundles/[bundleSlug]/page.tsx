import { redirect } from 'next/navigation';

// async function getBundleBySlug(slug: string) {
//   const response = await contentfulClient.getEntries<ContentfulCourseBundleFields>({
//     content_type: 'hub',
//     'fields.slug': slug,
//   });
//   return response.items[0];
// }

export default async function Page() {
  redirect('/');

  // const hub = await getHubBySlug(params.bundleSlug);
  // const videoToken = {} as MuxToken;
  // return (
  //     <main className="max-w-screen-2xl mx-auto p-8">
  //         <div className="relative min-h-[50vh] m-8 px-2 grid grid-cols-10 items-center max-w-screen-2xl mx-auto">
  //             <div className="col-span-7 col-start-2 bg-bt-teal shadow-2xl rounded-3xl h-fit flex flex-col justify-center p-10 z-10 max-w-sm">
  //                 <span className="uppercase text-sm text-white/70 tracking-widest">Destination Hub</span>
  //                 <h1 className="text-6xl/[3.5rem] font-bold mt-3 text-white">{hub.fields.title}</h1>
  //                 <p className="max-w-[80%] text-lg/6 font-bodycopy mt-3 text-white/90">
  //                     {hub.fields.shortDescription}
  //                 </p>
  //                 <Button size="small" className="mt-8 max-w-fit font-bold">
  //                     Unlock London
  //                 </Button>
  //             </div>
  //             <div className="absolute w-full h-full col-span-10 md:col-span-7 col-start-1 md:col-start-3 rounded-3xl overflow-hidden">
  //                 {hub.fields.heroVideo && videoToken ? (
  //                     <LegacyVideoPlayer
  //                         // ref={videoRef}
  //                         muted
  //                         playsInline
  //                         // onCanPlay={() => videoRef.current?.play()}
  //                         autoPlay
  //                         className="object-cover"
  //                         muxVideo={hub.fields.heroVideo}
  //                         muxToken={videoToken.video}
  //                         muxPosterToken={videoToken.thumbnail}
  //                         controls={false}
  //                         loop
  //                     />
  //                 ) : (
  //                     <Image
  //                         src={`https:${hub.fields.heroImage.fields.file.url}`}
  //                         alt=""
  //                         className="object-cover"
  //                         fill
  //                         sizes="100vw"
  //                         priority
  //                         // loader={contentfulImageLoader}
  //                     />
  //                 )}
  //             </div>
  //         </div>
  //     </main>
  // );
}
