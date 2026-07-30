import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateContent } from './content-domain.mjs';

const dataDirectory = path.join(process.cwd(), 'data');
const contentFile = path.join(dataDirectory, 'site-content.json');
let writeQueue = Promise.resolve();

const imageSlots = [
  ['home.hero.1', '首页', 'Hero 轮播图 1', '/img/hero/metal-fabrication.jpg'],
  ['home.hero.2', '首页', 'Hero 轮播图 2', '/img/hero/precision-engineering.jpg'],
  ['home.hero.3', '首页', 'Hero 轮播图 3', '/img/hero/industrial-equipment.jpg'],
  ['home.whoWeAre.poster', '首页', 'Who We Are 视频封面', '/img/lanchuang/factory-2.jpg'],
  ['home.service.1', '首页 / Services', 'Standard & OEM Manufacturing', '/img/services/standard-oem.jpg'],
  ['home.service.2', '首页 / Services', 'Reliable Production', '/img/services/production-machining.jpg'],
  ['home.service.3', '首页 / Services', 'Strict Quality Control', '/img/services/quality-control.jpg'],
  ['home.service.4', '首页 / Services', 'Surface Treatment Options', '/img/services/surface-treatment.jpg'],
  ['home.application.1', '首页', 'Construction & Infrastructure', '/img/lanchuang/anchor-wedge-1.png'],
  ['home.application.2', '首页', 'Automotive & Transportation', '/img/applications/automotive-machining.jpg'],
  ['home.application.3', '首页', 'Machinery & Equipment', '/img/applications/flange-components.jpg'],
  ['home.application.4', '首页', 'Electronics & Electrical', '/img/applications/quality-measurement.jpg'],
  ['home.application.5', '首页', 'Rail & Infrastructure', '/img/applications/lap-joint-flanges.jpg'],
  ['home.application.6', '首页', 'Custom / OEM Projects', '/img/applications/custom-oem-quality.jpg'],
  ['products.banner', '产品页', '产品页顶部横幅', '/img/lanchuang/factory-1.jpg'],
  ['about.banner', '关于我们', '关于我们顶部横幅', '/img/lanchuang/factory-1.jpg'],
  ['about.factory', '关于我们', '公司工厂图片', '/img/lanchuang/factory-2.jpg'],
  ['about.cta', '关于我们', '关于我们底部图片', '/img/lanchuang/factory-1.jpg'],
  ['services.banner', '服务页', '服务页顶部横幅', '/img/lanchuang/factory-2.jpg'],
  ['contact.banner', '联系我们', '联系我们顶部横幅', '/img/lanchuang/factory-2.jpg'],
];

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `item-${Date.now().toString(36)}`;
}

export async function createDefaultContent() {
  const source = JSON.parse(await readFile(path.join(process.cwd(), 'src', 'app', 'products_data.json'), 'utf8'));
  const categoryNames = ['Bolt', 'Nut', 'Threaded Rods', 'Anchor', 'Washer', 'Screw'];
  const categories = categoryNames.map((name) => ({
    id: slugify(name),
    name,
    image: source.find((product) => product.Category === name)?.Thumbnail || '/img/lanchuang/factory-1.jpg',
  }));
  const usedIds = new Set();
  const products = source.map((product, index) => {
    let id = slugify(product['Product Name']);
    if (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    return {
      id,
      categoryId: categories.find((category) => category.name === product.Category)?.id || categories[0].id,
      name: product['Product Name'],
      thumbnail: product.Thumbnail || '',
      descriptionHtml: product['Description HTML'] || '',
    };
  });
  return {
    version: 1,
    updatedAt: null,
    site: {
      name: 'Lan Chuang Fasteners',
      logo: '/img/lanchuang/logo.jpg?v=20260728-1',
      email: 'info@handanbolt.com',
    },
    categories,
    products,
    contacts: [
      { id: 'white-cheng', name: 'White Cheng', displayNumber: '+86 133 3310 5125', whatsappNumber: '8613333105125' },
      { id: 'ava', name: 'Ava', displayNumber: '+86 177 3100 7148', whatsappNumber: '8617731007148' },
      { id: 'flynn', name: 'Flynn', displayNumber: '+86 152 3209 0227', whatsappNumber: '8615232090227' },
    ],
    socials: [
      { id: 'facebook', label: 'Facebook', url: '' },
      { id: 'instagram', label: 'Instagram', url: '' },
      { id: 'tiktok', label: 'TikTok', url: '' },
      { id: 'youtube', label: 'YouTube', url: '' },
      { id: 'linkedin', label: 'LinkedIn', url: '' },
    ],
    images: imageSlots.map(([id, group, label, url]) => ({ id, group, label, url })),
  };
}

export async function readContent() {
  try {
    return JSON.parse(await readFile(contentFile, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return createDefaultContent();
    throw error;
  }
}

export async function writeContent(content) {
  const result = validateContent(content);
  if (!result.ok) throw new Error(result.errors.join(' '));
  const next = { ...content, version: 1, updatedAt: new Date().toISOString() };
  writeQueue = writeQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${contentFile}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    await rename(temporaryFile, contentFile);
  });
  await writeQueue;
  return next;
}
