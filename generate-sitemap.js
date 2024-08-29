import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

const dynamicRoutes = [
  '/rent-monitors-chiangmai/1',
  '/rent-monitors-chiangmai/2',
  '/rent-monitors-chiangmai/3',
  '/rent-monitors-chiangmai/4',
  '/rent-monitors-chiangmai/5',
  '/rent-monitors-chiangmai/6',
];
// Create a sitemap stream
const sitemap = new SitemapStream({ hostname: 'https://www.moni.rent' });

// Add URLs
sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({
  url: '/rent-monitors-chiangmai',
  changefreq: 'weekly',
  priority: 0.8,
});

// Add dynamic URLs
dynamicRoutes.forEach((url) => {
  sitemap.write({ url, changefreq: 'weekly', priority: 0.7 });
});
sitemap.end();

// Convert the stream to a string and save it
streamToPromise(sitemap).then((data) => {
  fs.writeFileSync('dist/sitemap.xml', data.toString());
});
