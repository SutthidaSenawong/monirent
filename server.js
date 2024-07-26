import { createServer, Model, Response } from 'miragejs';
import LG27 from './src/assets/LG27.png';
import MSI25 from './src/assets/MSI25.png';
import Portable from './src/assets/Portable15.6.png';

createServer({
  models: {
    monitors: Model,
    // users: Model,
  },

  seeds(server) {
    server.create('monitor', {
      id: '1',
      name: '27" LG Full HD Monitor with AMD FreeSync™',
      price: 350,
      description:
        'LG 27" Desktop Monitor, IPS panel, 1920 x 1080 FHD, 100Hz, 5ms response time, AMD FreeSync™, Flicker-safe, Black Stabilizer',
      imageUrl: LG27,
      info: "The LG 27MR400-B monitor features a fast-response IPS display with a resolution of 1920x1080. LG's FHD IPS display offers vibrant colors and sharpness from wide viewing angles. It supports AMD FreeSync technology, which reduces screen tearing, allowing you to work efficiently and effortlessly.",
      spec: [
        { MODEL: '27MR400-B' },
        { CONNECTIVITY: '1x D-SUB, 1x HDMI, Audio Line-Out' },
        { DISPLAY: 'IPS 27-inch (1920x1080p)' },
        { 'Response Time': '5ms' },
        { DIMENSIONS: '61.17(W) x 5.05(D) x 36.23(H) cm x  3.84 kg' },
        { COLOR: 'sRGB 99%' },
      ],
    });
    server.create('monitor', {
      id: '2',
      name: '24.5" MSI Full HD Monitor EyesErgo technology',
      price: 350,
      description:
        'MSI 24.5" Desktop Monitor, IPS panel, 1920 x 1080 FHD, 100Hz, 1ms response time, Two built-in Speakers, EyesErgo technology, Anti-Flicker, Less Blue-Light, Anti-Glare',
      imageUrl: MSI25,
      info: 'The MSI PRO MP251 Series monitor enhances focus and saves space. Its EyesErgo technology promotes better health by reducing fatigue with its ergonomic design. Also elevate visual quality and performance through seamless hardware and software integration, introducing innovative 100Hz technology for future-proof productivity.',
      spec: [
        { MODEL: 'PRO MP251' },
        { CONNECTIVITY: '1x HDMI (1.4b) 1x D-Sub (VGA)' },
        { DISPLAY: 'IPS 24.5-inch (1920x1080p)' },
        { 'Response Time': '1ms' },
        { DIMENSIONS: '63(W) x 12.5(D) x 41.1(H) cm x 2.9 kg' },
        { COLOR: '8 bits SRGB 101%' },
      ],
    });
    server.create('monitor', {
      id: '3',
      name: '15.6" Portable Monitor GOOJODOQ ',
      price: 300,
      description:
        'Compatible with PC, laptop, iPad, phone, PS4, XBOX, Nintendo Switch, and built-in speakers.',
      imageUrl: Portable,
      info: "Ultra-Slim Portable Display - With a thickness of just 1 cm and weighing 655g, this display is easy to slip into your bag and take anywhere, it's perfect for on-the-go use.",
      spec: [
        { MODEL: '27MR400-B' },
        {
          CONNECTIVITY:
            '2 USB-C ports, Mini HDMI, 3.5mm audio jack (headphone).',
        },
        { DISPLAY: 'IPS 15.6-inch (1920x1080p)' },
        { 'Response Time': '-' },
        { DIMENSIONS: '35.5(W) x 0.5(D) x 22(H) cm x  655g' },
        { COLOR: 'NTSC 72%' },
      ],
    });
  },

  routes() {
    this.namespace = 'api';
    this.logging = false;
    // this.timing = 2000  // => mock a 2 second delay in server response

    this.get('/monitors', (schema, request) => {
      // return new Response(400, {}, {error: "Error fetching data"})
      // console.log('Hello');
      return schema.monitors.all();
      // return { value: 'hello' };
    });

    this.get('/monitors/:id', (schema, request) => {
      const id = request.params.id;
      return schema.monitors.find(id);
    });
  },
});
