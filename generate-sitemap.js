import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

// Create a sitemap stream
const sitemap = new SitemapStream({ hostname: 'https://www.moni.rent' });

// Add URLs
sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/about', changefreq: 'weekly', priority: 0.8 });
sitemap.end();

// Convert the stream to a string and save it
streamToPromise(sitemap).then((data) => {
  fs.writeFileSync('dist/sitemap.xml', data.toString());
});
