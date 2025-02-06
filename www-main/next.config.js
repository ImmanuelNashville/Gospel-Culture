// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  images: {
    domains: [
      'images.ctfassets.net',
      's.gravatar.com',
      'brighttrip.com',
      'btripstaging.wpengine.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'img.brighttrip.com',
      'image.mux.com',
      'images.unsplash.com',
      'undefined',
      'downloads.ctfassets.net',
    ],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  async rewrites() {
    return [
      { source: '/sailing', destination: '/coming-soon/sailing' },
      { source: '/subscribe', destination: '/subscription' },
      { source: '/signup', destination: '/api/auth/signup' },
      { source: '/login', destination: '/api/auth/login' },
    ];
  },
  async redirects() {
    return [
      // INTERNAL
      { source: '/library', destination: '/subscription', permanent: true },
      { source: '/subscription-library', destination: '/subscription', permanent: true },
      {
        source: '/coming-soon/how-to-appreciate-art',
        destination: '/courses/how-to-appreciate-art',
        permanent: true,
      },
      {
        source: '/parismap',
        destination: '/playlists/map-explainers?v=EOajTltUaHi4M8v3vBrUL',
        permanent: true,
      },
      {
        source: '/coming-soon/travel-journalism',
        destination: '/courses/travel-journalism',
        permanent: true,
      },
      {
        source: '/coming-soon/europe-by-train',
        destination: '/courses/europe-by-train',
        permanent: true,
      },
      // NORTHERN LIGHTS
      { source: '/northern-lights', destination: '/courses/how-to-catch-the-northern-lights', permanent: true },
      {
        source: '/coming-soon/chase-the-northern-lights',
        destination: '/courses/how-to-catch-the-northern-lights',
        permanent: true,
      },
      {
        source: '/courses/chase-the-northern-lights',
        destination: '/courses/how-to-catch-the-northern-lights',
        permanent: true,
      },
      {
        source: '/subscription',
        destination: '/',
        permanent: true,
      },
      // ARCHIVED COURSES
      {
        source: '/courses/tokyo-demystified',
        destination: '/courses/experience-tokyo',
        permanent: true,
      },
      {
        source: '/guides/tokyo-demystified',
        destination: '/courses/experience-tokyo',
        permanent: true,
      },
      // TRAVEL GUIDES
      { source: '/jordan', destination: '/guides/jordan', permanent: false },
      { source: '/courses/jordan', destination: '/guides/jordan', permanent: true },
      { source: '/courses/qatar', destination: '/guides/qatar', permanent: true },
      { source: '/qatar', destination: '/guides/qatar', permanent: false },
      { source: '/zion', destination: '/guides/zion', permanent: true },
      { source: '/coming-soon/zion', destination: '/guides/zion', permanent: true },
      // MENTIONED IN VIDEO TRAILERS
      { source: '/tokyo', destination: '/courses/experience-tokyo', permanent: true },
      { source: '/SoloTravel', destination: '/courses/solo-travel-explained', permanent: true },
      { source: '/camping101', destination: '/courses/camping-101', permanent: true },
      { source: '/capetown', destination: '/courses/cape-town-demystified', permanent: true },
      {
        source: '/language',
        destination: '/courses/the-ultimate-language-learning-guide',
        permanent: true,
      },
      {
        source: '/londontrip',
        destination: '/courses/how-to-plan-your-london-trip',
        permanent: true,
      },
      { source: '/birding', destination: '/courses/birding-101', permanent: true },
      { source: '/how-to-vlog', destination: '/courses/how-to-vlog', permanent: true },
      {
        source: '/how-to-travel-journal',
        destination: '/courses/the-art-of-mindful-journaling',
        permanent: true,
      },
      {
        source: '/pandemic-travel',
        destination: '/courses/traveling-during-a-pandemic',
        permanent: true,
      },
      // BRIGHT TRIP
      {
        source: '/storytelling/brighttrip/ig',
        destination:
          '/courses/visual-storytelling?utm_source=instagram&utm_medium=stories&utm_campaign=storytelling_launch',
        permanent: false,
      },
      {
        source: '/storytelling/brighttrip/yt',
        destination:
          '/courses/visual-storytelling?utm_source=youtube&utm_medium=community_tab&utm_campaign=storytelling_launch',
        permanent: false,
      },
      {
        source: '/storytelling/brighttrip/fb',
        destination:
          '/courses/visual-storytelling?utm_source=facebook&utm_medium=post&utm_campaign=storytelling_launch',
        permanent: false,
      },
      // CREATORS
      {
        source: '/johnnyharris',
        destination: '/creators/johnny-harris?utm_source=creator_johnny_harris',
        permanent: false,
      },
      {
        source: '/subscription/johnnyharris15',
        destination: '/subscription?utm_source=creator_johnny_harris&promo=JOHNNYHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/johnnyharris',
        destination: '/subscription?utm_source=creator_johnny_harris&promo=JOHNNYHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/johnnyharris/yt',
        destination: '/subscription?utm_source=creator_johnny_harris&utm_medium=youtube&promo=JOHNNYHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/johnnyharris/ig',
        destination: '/subscription?utm_source=creator_johnny_harris&utm_medium=instagram&promo=JOHNNYHARRIS15',
        permanent: false,
      },
      {
        source: '/johnnyharris/storytelling/yt',
        destination: '/courses/visual-storytelling?utm_source=creator_johnny_harris&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/johnnyharris/storytelling/ig',
        destination: '/courses/visual-storytelling?utm_source=creator_johnny_harris&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/johnnyharris/storytelling/igs',
        destination: '/courses/visual-storytelling?utm_source=creator_johnny_harris&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/johnnyharris/storytelling/giftguide',
        destination: '/courses/visual-storytelling?utm_source=creator_johnny_harris&utm_medium=giftguide',
        permanent: true,
      },
      {
        source: '/johnnyharris/storytelling/newsletter',
        destination: '/courses/visual-storytelling?utm_source=creator_johnny_harris&utm_medium=newsletter',
        permanent: true,
      },
      {
        source: '/izharris',
        destination: '/creators/iz-harris?utm_source=creator_iz_harris',
        permanent: false,
      },
      {
        source: '/subscription/izharris15',
        destination: '/subscription?utm_source=creator_iz_harris&promo=IZHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/izharris',
        destination: '/subscription?utm_source=creator_iz_harris&promo=IZHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/izharris/yt',
        destination: '/subscription?utm_source=creator_iz_harris&utm_medium=youtube&promo=IZHARRIS15',
        permanent: false,
      },
      {
        source: '/subscription/izharris/ig',
        destination: '/subscription?utm_source=creator_iz_harris&utm_medium=instagram&promo=IZHARRIS15',
        permanent: false,
      },
      {
        source: '/nathanieldrew',
        destination: '/creators/nathaniel-drew?utm_source=creator_nathaniel_drew',
        permanent: false,
      },
      {
        source: '/subscription/nathanieldrew15',
        destination: '/subscription?utm_source=creator_nathaniel_drew&promo=NATHANIELDREW15',
        permanent: false,
      },
      {
        source: '/subscription/nathanieldrew',
        destination: '/subscription?utm_source=creator_nathaniel_drew&promo=NATHANIELDREW15',
        permanent: false,
      },
      {
        source: '/nathanieldrew/storytelling',
        destination: '/courses/visual-storytelling?utm_source=creator_nathaniel_drew',
        permanent: true,
      },
      {
        source: '/nathanieldrew/language',
        destination: '/courses/the-ultimate-language-learning-guide?utm_source=creator_nathaniel_drew',
        permanent: true,
      },
      {
        source: '/elenataber',
        destination: '/courses/how-to-vlog?utm_source=creator_elena_taber',
        permanent: true,
      },
      {
        source: '/jordansparrow',
        destination: '/creators/jordan-sparrow?utm_source=creator_jordan_sparrow',
        permanent: true,
      },
      {
        source: '/lucashyce',
        destination: '/courses/birding-101?utm_source=creator_lucas_hyce',
        permanent: true,
      },
      {
        source: '/elinaosborne',
        destination: '/courses/adventure-filmmaking?utm_source=creator_elina_osborne',
        permanent: true,
      },
      {
        source: '/mwitachacha',
        destination: '/courses/drones-101?utm_source=creator_mwita_chacha',
        permanent: true,
      },
      {
        source: '/jessdante',
        destination: '/subscription?utm_source=creator_jess_dante&promo=JESSDANTE15',
        permanent: true,
      },
      {
        source: '/justinpoore',
        destination: '/courses/cape-town-demystified?utm_source=creator_justin_poore',
        permanent: true,
      },
      {
        source: '/lexiealford',
        destination: '/courses/solo-travel-explained?utm_source=creator_lexie_alford',
        permanent: true,
      },
      {
        source: '/libbyzietsmanbrodie',
        destination: '/courses/wine-and-vineyards?utm_source=creator_libby_zietsman_brodie',
        permanent: true,
      },
      {
        source: '/danielsteiner',
        destination: '/courses/how-it-became-manhattan?utm_source=creator_daniel_steiner',
        permanent: true,
      },
      {
        source: '/jofranco',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco',
        permanent: false,
      },
      {
        source: '/jofranco/yt',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=youtube',
        permanent: false,
      },
      {
        source: '/jofranco/ct',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=community_tab',
        permanent: false,
      },
      {
        source: '/jofranco/ig',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=instagram',
        permanent: false,
      },
      {
        source: '/jofranco/igs',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=instagram_stories',
        permanent: false,
      },
      {
        source: '/jofranco/web',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=web',
        permanent: false,
      },
      {
        source: '/jofranco/newsletter',
        destination: '/courses/the-art-of-mindful-journaling?utm_source=creator_jo_franco&utm_medium=newsletter',
        permanent: false,
      },
      {
        source: '/kurtisandchelsey',
        destination: '/courses/adventure-cats?utm_source=creator_kurtis_and_chelsey',
        permanent: true,
      },
      {
        source: '/marenhunsberger',
        destination: '/courses/traveling-during-a-pandemic?utm_source=creator_maren_hunsberger',
        permanent: true,
      },
      {
        source: '/aaronpalabyab',
        destination: '/courses/the-ultimate-guide-to-filipino-food?utm_source=creator_aaron_palabyab',
        permanent: true,
      },
      {
        source: '/colenetan',
        destination: '/courses/the-ultimate-guide-to-filipino-food?utm_source=creator_colene_tan',
        permanent: true,
      },
      {
        source: '/woltersworld',
        destination: '/courses/how-to-plan-your-trip?utm_source=creator_wolters_world',
        permanent: true,
      },
      {
        source: '/chrishau',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau',
        permanent: true,
      },
      {
        source: '/chrishau/yt',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/chrishau/ct',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau&utm_medium=community_tab',
        permanent: true,
      },
      {
        source: '/chrishau/igs',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/chrishau/web',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau&utm_medium=web',
        permanent: true,
      },
      {
        source: '/chrishau/newsletter',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_chris_hau&utm_medium=newsletter',
        permanent: true,
      },
      {
        source: '/nicoleeddy',
        destination: '/subscription?utm_source=creator_nicole_eddy_&promo=NICOLEEDDY15',
        permanent: true,
      },
      {
        source: '/nicoleeddy/yt',
        destination: '/courses/the-ultimate-safari-guide?utm_source=creator_nicole_eddy&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/nicoleeddy/ct',
        destination: '/courses/the-ultimate-safari-guide?utm_source=creator_nicole_eddy&utm_medium=community_tab',
        permanent: true,
      },
      {
        source: '/nicoleeddy/ig',
        destination: '/courses/the-ultimate-safari-guide?utm_source=creator_nicole_eddy&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/nicoleeddy/igs',
        destination: '/courses/the-ultimate-safari-guide?utm_source=creator_nicole_eddy&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/nicoleeddy/fb',
        destination: '/courses/the-ultimate-safari-guide?utm_source=creator_nicole_eddy&utm_medium=facebook',
        permanent: true,
      },
      {
        source: '/camila-e-bruna',
        destination: '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/yt',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/ytcamila',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/ytbruna',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/ig',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/igcamila',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/igbruna',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/camila-e-bruna/fb',
        destination:
          '/courses/como-planejar-uma-viagem-que-cabe-no-seu-bolso?utm_source=creator_camila_bruna&utm_medium=facebook',
        permanent: true,
      },
      {
        source: '/raya-and-louis',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya-and-louis',
        permanent: true,
      },
      {
        source: '/raya-and-louis/yt',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya-and-louis&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/raya-and-louis/igs',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya-and-louis&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/raya/yt',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/raya/ct',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya&utm_medium=community_tab',
        permanent: true,
      },
      {
        source: '/raya/igs',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/raya/tw',
        destination: '/courses/van-life-a-practical-guide?utm_source=raya&utm_medium=twitter',
        permanent: true,
      },
      {
        source: '/louis/yt',
        destination: '/courses/van-life-a-practical-guide?utm_source=louis&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/louis/ct',
        destination: '/courses/van-life-a-practical-guide?utm_source=louis&utm_medium=community_tab',
        permanent: true,
      },
      {
        source: '/louis/igs',
        destination: '/courses/van-life-a-practical-guide?utm_source=louis&utm_medium=instagram_stories',
        permanent: true,
      },
      {
        source: '/louis/fb',
        destination: '/courses/van-life-a-practical-guide?utm_source=louis&utm_medium=facebook',
        permanent: true,
      },
      {
        source: '/louis/tw',
        destination: '/courses/van-life-a-practical-guide?utm_source=louis&utm_medium=twitter',
        permanent: true,
      },
      {
        source: '/mariebriere',
        destination: '/courses/french-cheese-mapped?utm_source=marie-briere',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board',
        destination: '/courses/jordan?utm_source=jordan-tourism-board',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board/web',
        destination: '/courses/jordan?utm_source=jordan-tourism-board&utm_medium=web',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board/ig',
        destination: '/courses/jordan?utm_source=jordan-tourism-board&utm_medium=instagram',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board/fb',
        destination: '/courses/jordan?utm_source=jordan-tourism-board&utm_medium=facebook',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board/yt',
        destination: '/courses/jordan?utm_source=jordan-tourism-board&utm_medium=youtube',
        permanent: true,
      },
      {
        source: '/jordan-tourism-board/tiktok',
        destination: '/courses/jordan?utm_source=jordan-tourism-board&utm_medium=tiktok',
        permanent: true,
      },
      {
        source: '/bernardo/yt',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=youtube',
        permanent: false,
      },
      {
        source: '/bernardo/ct',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=community_tab',
        permanent: false,
      },
      {
        source: '/bernardo/ig',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=instagram',
        permanent: false,
      },
      {
        source: '/bernardo/igs',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=instagram_stories',
        permanent: false,
      },
      {
        source: '/bernardo/web',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=web',
        permanent: false,
      },
      {
        source: '/bernardo/newsletter',
        destination: '/courses/how-to-road-trip-morocco?utm_source=creator_bernardo&utm_medium=newsletter',
        permanent: false,
      },
      {
        source: '/bernardo/sub/yt',
        destination: '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=youtube',
        permanent: false,
      },
      {
        source: '/bernardo/sub/ct',
        destination: '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=community_tab',
        permanent: false,
      },
      {
        source: '/bernardo/sub/ig',
        destination: '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=instagram',
        permanent: false,
      },
      {
        source: '/bernardo/sub/igs',
        destination:
          '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=instagram_stories',
        permanent: false,
      },
      {
        source: '/bernardo/sub/web',
        destination: '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=web',
        permanent: false,
      },
      {
        source: '/bernardo/sub/newsletter',
        destination: '/subscription?term=annual&promo=BERNARDO15&utm_source=creator_bernardo&utm_medium=newsletter',
        permanent: false,
      },
      {
        source: '/sarah/yt',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=youtube',
        permanent: false,
      },
      {
        source: '/sarah/ct',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=community_tab',
        permanent: false,
      },
      {
        source: '/sarah/ig',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=instagram',
        permanent: false,
      },
      {
        source: '/sarah/igs',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=instagram_stories',
        permanent: false,
      },
      {
        source: '/sarah/fb',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=facebook',
        permanent: false,
      },
      {
        source: '/sarah/li',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=linkedin',
        permanent: false,
      },
      {
        source: '/sarah/tw',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=twitter',
        permanent: false,
      },
      {
        source: '/sarah/newsletter',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=newsletter',
        permanent: false,
      },
      {
        source: '/sarah/web',
        destination: '/courses/how-to-appreciate-art?utm_source=creator_sarah_green&utm_medium=web',
        permanent: false,
      },
      //Influencer Marketing
      {
        source: '/how-to-get-paid-to-travel/sacredthomas',
        destination: '/courses/how-to-get-paid-to-travel?utm_source=creator_sacred_thomas',
        permanent: true,
      },
      {
        source: '/tokyo/ah',
        destination:
          '/tokyo?utm_source=at_hotel&utm_medium=instagram&utm_campaign=tokyo_q2_2023&pc=AH20&c=OxxRg0mEO6vJEgh6XPatv',
        permanent: true,
      },
      // COURSES
      {
        source: '/courses/iceland',
        destination: '/courses/southern-iceland-roadtrip',
        permanent: true,
      },
      {
        source: '/course/language',
        destination: '/courses/the-ultimate-language-learning-guide',
        permanent: true,
      },
      {
        source: '/course/documentyourtrip',
        destination: '/courses/how-to-document-your-trip',
        permanent: true,
      },
      {
        source: '/course/tokyo',
        destination: '/courses/experience-tokyo',
        permanent: true,
      },
      {
        source: '/course/drones101',
        destination: '/courses/drones-101',
        permanent: true,
      },
      {
        source: '/course/how-new-york-came-to-be',
        destination: '/courses/how-it-became-manhattan',
        permanent: true,
      },
      {
        source: '/course/how-it-became-paris',
        destination: '/courses/how-it-became-paris',
        permanent: true,
      },
      {
        source: '/course/iceland',
        destination: '/courses/southern-iceland-roadtrip',
        permanent: true,
      },
      {
        source: '/course/travelwithkids',
        destination: '/courses/how-to-travel-with-kids',
        permanent: true,
      },
      {
        source: '/course/howtovlog',
        destination: '/courses/how-to-vlog',
        permanent: true,
      },
      {
        source: '/course/birding-101',
        destination: '/courses/birding-101',
        permanent: true,
      },
      {
        source: '/course/pandemic-travel',
        destination: '/courses/traveling-during-a-pandemic',
        permanent: true,
      },
      {
        source: '/course/costarica',
        destination: '/courses/costa-rica-demystified',
        permanent: true,
      },
      {
        source: '/course/londontrip',
        destination: '/courses/how-to-plan-your-london-trip',
        permanent: true,
      },
      {
        source: '/course/filipino-food',
        destination: '/courses/the-ultimate-guide-to-filipino-food',
        permanent: true,
      },
      {
        source: '/course/londontransportation',
        destination: '/courses/londons-transportation-explained',
        permanent: true,
      },
      {
        source: '/course/how-to-travel-journal',
        destination: '/courses/the-art-of-mindful-journaling',
        permanent: true,
      },
      {
        source: '/courses/the-ultimate-guide-to-travel-journaling',
        destination: '/courses/the-art-of-mindful-journaling',
        permanent: true,
      },
      {
        source: '/course/howtopack',
        destination: '/courses/packing-cubes-101',
        permanent: true,
      },
      {
        source: '/course/camerafundamentals',
        destination: '/courses/camera-fundamentals',
        permanent: true,
      },
      {
        source: '/course/capetown',
        destination: '/courses/cape-town-demystified',
        permanent: true,
      },
      {
        source: '/course/wine-vineyards',
        destination: '/courses/wine-and-vineyards',
        permanent: true,
      },
      {
        source: '/course/solotravel',
        destination: '/courses/solo-travel-explained',
        permanent: true,
      },
      {
        source: '/course/camping101',
        destination: '/courses/camping-101',
        permanent: true,
      },
      {
        source: '/course/adventurefilmmaking',
        destination: '/courses/adventure-filmmaking',
        permanent: true,
      },
      {
        source: '/course/adventure-cats',
        destination: '/courses/adventure-cats',
        permanent: true,
      },
      {
        source: '/europebytrain',
        destination: '/courses/europe-by-train',
        permanent: true,
      },
      {
        source: '/traveljournalism',
        destination: '/courses/travel-journalism',
        permanent: true,
      },
      // WORDPRESS SITE MISC.
      {
        source: '/user_account/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/user_account/my-courses',
        destination: '/my-courses',
        permanent: true,
      },
      {
        source: '/user_account/my-profile',
        destination: '/profile',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/cart',
        permanent: true,
      },
      {
        source: '/careers',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/make',
        destination: '/contact-us',
        permanent: true,
      },
      {
        source: '/get-started',
        destination: '/contact-us',
        permanent: true,
      },
      // MISC
      {
        source: '/yt/dc',
        destination: '/subscription?term=monthly',
        permanent: false,
      },
    ];
  },
});
