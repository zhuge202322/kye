const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

const clone = (value) => structuredClone(value);
const clean = (value) => String(value ?? '').trim();
const isWebUrl = (value) => /^https?:\/\//i.test(clean(value));
const isAssetUrl = (value) => clean(value).startsWith('/') || isWebUrl(value);

export const ORDER_STATUSES = ['pending', 'confirmed', 'in_production', 'quality_check', 'ready_to_ship', 'shipped', 'completed'];

function slugify(value) {
  const slug = clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `item-${Date.now().toString(36)}`;
}

function uniqueId(items, seed) {
  const base = slugify(seed);
  let id = base;
  let suffix = 2;
  while (items.some((item) => item.id === id)) id = `${base}-${suffix++}`;
  return id;
}

export function validateContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object') return { ok: false, errors: ['Content must be an object.'] };
  if (!clean(content.site?.name)) errors.push('Website name is required.');
  if (!clean(content.site?.logo)) errors.push('Company logo is required.');
  else if (!isAssetUrl(content.site.logo)) errors.push('Company logo must use a site path or an HTTP(S) URL.');
  if (clean(content.site?.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(content.site.email))) errors.push('Contact email is invalid.');
  if (!Array.isArray(content.categories)) errors.push('Categories must be an array.');
  if (!Array.isArray(content.products)) errors.push('Products must be an array.');
  if (!Array.isArray(content.contacts)) errors.push('Contacts must be an array.');
  if (!Array.isArray(content.socials)) errors.push('Social links must be an array.');
  if (!Array.isArray(content.images)) errors.push('Page images must be an array.');
  if (!Array.isArray(content.orders)) errors.push('Orders must be an array.');

  for (const key of ['categories', 'products', 'contacts', 'socials', 'images', 'orders']) {
    const ids = (content[key] ?? []).map((item) => clean(item.id));
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) errors.push(`${key} must use unique identifiers.`);
  }
  const categoryNames = (content.categories ?? []).map((item) => clean(item.name).toLowerCase());
  if (categoryNames.some((name) => !name) || new Set(categoryNames).size !== categoryNames.length) errors.push('Category names must be present and unique.');
  const categoryIds = new Set((content.categories ?? []).map((item) => item.id));
  for (const product of content.products ?? []) {
    if (!clean(product.name)) errors.push('Every product needs a name.');
    if (!categoryIds.has(product.categoryId)) errors.push(`Product ${product.name || product.id} uses a missing category.`);
  }
  for (const contact of content.contacts ?? []) {
    if (!clean(contact.name) || !/^\d{6,20}$/.test(clean(contact.whatsappNumber))) {
      errors.push('Every contact needs a name and a WhatsApp number containing digits only.');
    }
  }
  for (const social of content.socials ?? []) {
    if (!clean(social.label)) errors.push('Every social link needs a label.');
    if (clean(social.url) && !isWebUrl(social.url)) errors.push(`${social.label || 'Social'} link must use HTTP(S).`);
  }
  for (const image of content.images ?? []) {
    if (!clean(image.group) || !clean(image.label) || !isAssetUrl(image.url)) errors.push('Every page image needs a group, label and safe image URL.');
  }
  const contractNumbers = (content.orders ?? []).map((order) => clean(order.contractNumber).toLowerCase());
  if (contractNumbers.some((number) => !number) || new Set(contractNumbers).size !== contractNumbers.length) errors.push('Contract numbers must be present and unique.');
  for (const order of content.orders ?? []) {
    if (!ORDER_STATUSES.includes(order.status)) errors.push(`Order ${order.contractNumber || order.id} has an invalid status.`);
    if (!Number.isInteger(order.progress) || order.progress < 0 || order.progress > 100) errors.push(`Order ${order.contractNumber || order.id} progress must be an integer from 0 to 100.`);
    if (!clean(order.updatedAt) || Number.isNaN(Date.parse(order.updatedAt))) errors.push(`Order ${order.contractNumber || order.id} needs a valid update time.`);
  }
  return { ok: errors.length === 0, errors };
}

function normalizeOrderInput(input, updatedAt) {
  const contractNumber = clean(input.contractNumber);
  const progress = Number(input.progress);
  if (!contractNumber) throw new Error('Contract number is required.');
  if (!ORDER_STATUSES.includes(input.status)) throw new Error('Order status is invalid.');
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) throw new Error('Order progress must be an integer from 0 to 100.');
  return {
    contractNumber,
    status: input.status,
    progress,
    note: clean(input.note),
    updatedAt,
  };
}

export function createOrder(content, input, updatedAt = new Date().toISOString()) {
  const next = clone(content);
  const normalized = normalizeOrderInput(input, updatedAt);
  if (next.orders.some((order) => clean(order.contractNumber).toLowerCase() === normalized.contractNumber.toLowerCase())) {
    throw new Error('Contract number already exists.');
  }
  next.orders.unshift({ id: uniqueId(next.orders, normalized.contractNumber), ...normalized });
  return next;
}

export function updateOrder(content, id, input, updatedAt = new Date().toISOString()) {
  const next = clone(content);
  const order = next.orders.find((candidate) => candidate.id === id);
  if (!order) throw new Error('Order not found.');
  const normalized = normalizeOrderInput(input, updatedAt);
  if (next.orders.some((candidate) => candidate.id !== id && clean(candidate.contractNumber).toLowerCase() === normalized.contractNumber.toLowerCase())) {
    throw new Error('Contract number already exists.');
  }
  Object.assign(order, normalized);
  return next;
}

export function deleteOrder(content, id) {
  const next = clone(content);
  const length = next.orders.length;
  next.orders = next.orders.filter((order) => order.id !== id);
  if (next.orders.length === length) throw new Error('Order not found.');
  return next;
}

export function findOrderByContractNumber(content, contractNumber) {
  const normalized = clean(contractNumber).toLowerCase();
  if (!normalized) return null;
  return content.orders?.find((order) => clean(order.contractNumber).toLowerCase() === normalized) ?? null;
}

export function toPublicContent(content) {
  const publicContent = clone(content);
  delete publicContent.orders;
  return publicContent;
}

export function createCategory(content, input) {
  const next = clone(content);
  const name = clean(input.name);
  if (!name) throw new Error('Category name is required.');
  if (next.categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('Category already exists.');
  }
  next.categories.push({ id: uniqueId(next.categories, name), name, image: clean(input.image) });
  return next;
}

export function updateCategory(content, id, input) {
  const next = clone(content);
  const item = next.categories.find((category) => category.id === id);
  if (!item) throw new Error('Category not found.');
  const name = clean(input.name);
  if (!name) throw new Error('Category name is required.');
  if (next.categories.some((category) => category.id !== id && category.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('Category already exists.');
  }
  Object.assign(item, { name, image: clean(input.image) });
  return next;
}

export function deleteCategory(content, id) {
  if (content.products.some((product) => product.categoryId === id)) {
    throw new Error('Category is used by one or more products. Move or delete those products first.');
  }
  const next = clone(content);
  const length = next.categories.length;
  next.categories = next.categories.filter((item) => item.id !== id);
  if (next.categories.length === length) throw new Error('Category not found.');
  return next;
}

export function createProduct(content, input) {
  const next = clone(content);
  const name = clean(input.name);
  if (!next.categories.some((item) => item.id === input.categoryId)) throw new Error('Product category does not exist.');
  if (!name) throw new Error('Product name is required.');
  next.products.push({
    id: uniqueId(next.products, name),
    categoryId: input.categoryId,
    name,
    thumbnail: clean(input.thumbnail),
    descriptionHtml: String(input.descriptionHtml ?? ''),
  });
  return next;
}

export function updateProduct(content, id, input) {
  const next = clone(content);
  const item = next.products.find((product) => product.id === id);
  if (!item) throw new Error('Product not found.');
  if (!next.categories.some((category) => category.id === input.categoryId)) throw new Error('Product category does not exist.');
  const name = clean(input.name);
  if (!name) throw new Error('Product name is required.');
  Object.assign(item, {
    categoryId: input.categoryId,
    name,
    thumbnail: clean(input.thumbnail),
    descriptionHtml: String(input.descriptionHtml ?? ''),
  });
  return next;
}

export function deleteProduct(content, id) {
  const next = clone(content);
  const length = next.products.length;
  next.products = next.products.filter((item) => item.id !== id);
  if (next.products.length === length) throw new Error('Product not found.');
  return next;
}

export function updateSiteSettings(content, input) {
  const next = clone(content);
  next.site = {
    ...next.site,
    name: clean(input.name),
    logo: clean(input.logo),
    email: clean(input.email),
  };
  const result = validateContent(next);
  if (!result.ok) throw new Error(result.errors.join(' '));
  return next;
}

export function validateUpload(file) {
  const name = clean(file?.name);
  const type = clean(file?.type).toLowerCase();
  const size = Number(file?.size ?? 0);
  const extension = name.split('.').pop()?.toLowerCase();
  const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
  if (!IMAGE_TYPES.has(type) || !allowedExtensions.has(extension)) return { ok: false, error: 'Only JPG, PNG, WebP, GIF and AVIF images are allowed.' };
  if (size <= 0 || size > MAX_UPLOAD_SIZE) return { ok: false, error: 'Image must be smaller than 8 MB.' };
  return { ok: true };
}

export function validateImageSignature(bytes, type) {
  const buffer = Buffer.from(bytes);
  if (type === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === 'image/gif') return buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'));
  if (type === 'image/webp') return buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (type === 'image/avif') {
    const brand = buffer.subarray(8, 12).toString('ascii');
    return buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp' && ['avif', 'avis', 'mif1'].includes(brand);
  }
  return false;
}

export function sanitizeFilename(name) {
  const extension = clean(name).split('.').pop()?.toLowerCase() || 'jpg';
  const base = clean(name).replace(/\.[^.]+$/, '');
  return `${slugify(base)}-${Date.now().toString(36)}.${extension}`;
}
