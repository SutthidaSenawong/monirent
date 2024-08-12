// import { createServer, Model, Response } from 'miragejs';
// import LG27 from './src/assets/LG27.png';
// import MSI25 from './src/assets/MSI25.png';
// import Portable from './src/assets/Portable15.6.png';

// createServer({
//   models: {
//     monitors: Model,
//     // users: Model,
//   },

//   seeds(server) {
//     server.create('monitor', {
//       id: '1',
//       name: '27" LG Full HD Monitor with AMD FreeSync™',
//       price: 350,
//       description:
//         'LG 27" Desktop Monitor, IPS panel, 1920 x 1080 FHD, 100Hz, 5ms response time, AMD FreeSync™, Flicker-safe, Black Stabilizer',
//       imageUrl: LG27,
//       info: "The LG 27MR400-B monitor features a fast-response IPS display with a resolution of 1920x1080. LG's FHD IPS display offers vibrant colors and sharpness from wide viewing angles. It supports AMD FreeSync technology, which reduces screen tearing, allowing you to work efficiently and effortlessly.",
//       spec: [
//         { MODEL: '27MR400-B' },
//         { CONNECTIVITY: '1x D-SUB, 1x HDMI, Audio Line-Out' },
//         { DISPLAY: 'IPS 27-inch (1920x1080p)' },
//         { 'Response Time': '5ms' },
//         { DIMENSIONS: '61.17(W) x 5.05(D) x 36.23(H) cm x  3.84 kg' },
//         { COLOR: 'sRGB 99%' },
//       ],
//     });
//     server.create('monitor', {
//       id: '2',
//       name: '24.5" MSI Full HD Monitor EyesErgo technology',
//       price: 350,
//       description:
//         'MSI 24.5" Desktop Monitor, IPS panel, 1920 x 1080 FHD, 100Hz, 1ms response time, Two built-in Speakers, EyesErgo technology, Anti-Flicker, Less Blue-Light, Anti-Glare',
//       imageUrl: MSI25,
//       info: 'The MSI PRO MP251 Series monitor enhances focus and saves space. Its EyesErgo technology promotes better health by reducing fatigue with its ergonomic design. Also elevate visual quality and performance through seamless hardware and software integration, introducing innovative 100Hz technology for future-proof productivity.',
//       spec: [
//         { MODEL: 'PRO MP251' },
//         { CONNECTIVITY: '1x HDMI (1.4b) 1x D-Sub (VGA)' },
//         { DISPLAY: 'IPS 24.5-inch (1920x1080p)' },
//         { 'Response Time': '1ms' },
//         { DIMENSIONS: '63(W) x 12.5(D) x 41.1(H) cm x 2.9 kg' },
//         { COLOR: '8 bits SRGB 101%' },
//       ],
//     });
//     server.create('monitor', {
//       id: '3',
//       name: '32" SAMSUNG 2K ',
//       price: 750,
//       description:
//         'SAMSUNG 32" Desktop Monitor, VA panel, 2560 x 1440 QHD, 165Hz, 1ms response time, AMD FreeSync™ Premium, HDR10 support, adjustability',
//       imageUrl: Portable,
//       info: 'Experience full immersion with QHD resolution, HDR10 support, and AMD FreeSync Premium. Enjoy real-time responsiveness with a 165Hz refresh rate. The ergonomic design ensures user comfort, allowing you to tilt, swivel, pivot, and adjust the screen to your preference.',
//       spec: [
//         { MODEL: 'ODYSSEY G5 LS32CG510EEXXT' },
//         {
//           CONNECTIVITY: '2x HDMI, 1xDP',
//         },
//         { DISPLAY: 'VA 32-inch (2560x1440p)' },
//         { 'Response Time': '1ms' },
//         { DIMENSIONS: '719.20 x 597.40 x 248.80 mm x  6.2 Kg' },
//         { COLOR: 'sRGB 100%' },
//       ],
//     });
//   },

//   routes() {
//     this.namespace = 'api';
//     this.logging = false;
//     // this.timing = 2000  // => mock a 2 second delay in server response
//     this.passthrough('https://firestore.googleapis.com/**');

//     this.get('/monitors', (schema, request) => {
//       // return new Response(400, {}, {error: "Error fetching data"})
//       // console.log('Hello');
//       return schema.monitors.all();
//       // return { value: 'hello' };
//     });

//     this.get('/monitors/:id', (schema, request) => {
//       const id = request.params.id;
//       return schema.monitors.find(id);
//     });
//   },
// });
