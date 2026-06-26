/** Impresoras gran formato Canon A1 B/N — imagePROGRAF TX (jun 2026). */

const PLOTTER_SPECS = {
  speed: '3.3 ppm',
  resolution: '2400 x 1200 ppp',
  ink: 'MBK/C/M/Y/BK',
};

const MFP_SPECS = {
  resolution: '1200 ppp',
  scanWidth: '36"',
  scanSoftware: 'SmartWorks MFP V6',
  scanSpeed: '13 ips / 3 ips / 6 ips',
};

export const CANON_GRAN_FORMATO_CATALOG = [
  {
    slug: 'tx-3200',
    model: 'TX 3200',
    variant: 'plotter',
    imageId: '91a4c1fc',
    specs: { ...PLOTTER_SPECS },
  },
  {
    slug: 'tx-4200',
    model: 'TX 4200',
    variant: 'plotter',
    imageId: '91a4c1fc',
    specs: { ...PLOTTER_SPECS },
  },
  {
    slug: 'tx-3200-mfp-z36',
    model: 'TX 3200 MFP Z36',
    variant: 'mfp',
    imageId: '91a4c1fc',
    specs: { ...MFP_SPECS },
  },
  {
    slug: 'tx-4200-mfp-z36',
    model: 'TX 4200 MFP Z36',
    variant: 'mfp',
    imageId: '91a4c1fc',
    specs: { ...MFP_SPECS },
  },
];
