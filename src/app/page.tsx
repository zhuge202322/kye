'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import { isLocale, isRtlLocale, localeOptions, translate, translateProductHtml, type Locale } from './i18n';
import productsData from './products_data.json';

type Product = {
 Category: string;
 'Product Name': string;
 Thumbnail: string;
 'Description HTML': string;
};

type ManagedContent = {
 site: { name: string; logo: string; email: string };
 categories: { id: string; name: string; image: string }[];
 products: { id: string; categoryId: string; name: string; thumbnail: string; descriptionHtml: string }[];
 contacts: { id: string; name: string; displayNumber: string; whatsappNumber: string }[];
 socials: { id: string; label: string; url: string }[];
 images: { id: string; group: string; label: string; url: string }[];
};

type WhatsAppContact = { id?: string; name: string; displayNumber: string; whatsappNumber: string };

type Service = {
 title: string;
 tagline: string;
 img: string;
 desc: string;
 icon: ReactNode;
};

const rawProducts = productsData as Product[];

// 提取所有不重复的分类名称，并为每个分类寻找一张代表图片
// Keep the catalogue order consistent across the homepage, navigation, filters and detail pages.
const categoryOrder = ['Bolt', 'Nut', 'Threaded Rods', 'Anchor', 'Washer', 'Screw'];
const products = [...rawProducts].sort(
 (firstProduct, secondProduct) => categoryOrder.indexOf(firstProduct.Category) - categoryOrder.indexOf(secondProduct.Category),
);
const availableCategories = new Set(products.map((product) => product.Category));
const categories = categoryOrder.filter((category) => availableCategories.has(category));
const categoryCards = categories.map((cat) => ({
 name: cat,
 image: products.find((product) => product.Category === cat)?.Thumbnail || '/img/lanchuang/factory-1.jpg',
}));

const socialLinks = [
 { id: 'facebook', label: 'Facebook', href: '' },
 { id: 'instagram', label: 'Instagram', href: '' },
 { id: 'tiktok', label: 'TikTok', href: '' },
 { id: 'youtube', label: 'YouTube', href: '' },
 { id: 'linkedin', label: 'LinkedIn', href: '' },
] as const;

function SocialIcon({ id }: { id: string }) {
 const paths = {
 facebook: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.438H7.078v-3.489h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.974h-1.513c-1.491 0-1.956.931-1.956 1.887v2.26h3.328l-.532 3.489h-2.796V24C19.612 23.094 24 18.1 24 12.073z',
 instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
 tiktok: 'M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743 2.895 2.895 0 015.201-1.743V12.18a6.329 6.329 0 00-5.394 10.692A6.33 6.33 0 0015.82 18.2V9.243a8.16 8.16 0 004.773 1.526V7.343a4.85 4.85 0 01-1.005-.657z',
 youtube: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
 linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.047c.475-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286h-.002zM5.337 7.433a2.063 2.063 0 110-4.126 2.063 2.063 0 010 4.126zM3.559 20.452h3.557V9H3.559v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
 } as const;

 if (id === 'instagram') {
 return (
 <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
 <defs>
 <linearGradient id="instagram-brand-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
 <stop offset="0" stopColor="#FFD600" />
 <stop offset="0.38" stopColor="#FF7A00" />
 <stop offset="0.68" stopColor="#FF0169" />
 <stop offset="1" stopColor="#D300C5" />
 </linearGradient>
 </defs>
 <path d={paths.instagram} fill="url(#instagram-brand-gradient)" />
 </svg>
 );
 }

 if (id === 'tiktok') {
 return (
 <svg className="h-4 w-4" viewBox="-1 -1 26 26" aria-hidden="true">
 <path d={paths.tiktok} fill="#25F4EE" transform="translate(-0.6 0.4)" />
 <path d={paths.tiktok} fill="#FE2C55" transform="translate(0.6 -0.4)" />
 <path d={paths.tiktok} fill="#111111" />
 </svg>
 );
 }

 const brandColors: Record<string, string> = {
 facebook: '#1877F2',
 youtube: '#FF0000',
 linkedin: '#0A66C2',
 } as const;

 if (!(id in paths)) {
 return (
 <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
 </svg>
 );
 }

 return (
 <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
 <path d={paths[id as keyof typeof paths]} fill={brandColors[id] || '#64748b'} />
 </svg>
 );
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
 return (
 <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
 <path d="M12.04 2A9.84 9.84 0 003.6 16.91L2 22l5.23-1.54A9.84 9.84 0 1012.04 2zm0 17.93a8.03 8.03 0 01-4.1-1.12l-.29-.17-3.1.91.94-3.02-.19-.31a8.08 8.08 0 116.74 3.71zm4.43-6.04c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.19-.72-.64-1.2-1.43-1.34-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.75-1.8-.19-.47-.39-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49c.12.16 1.7 2.59 4.11 3.64.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
 </svg>
 );
}

function EmailIcon({ className = 'w-5 h-5' }: { className?: string }) {
 return (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 );
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
 const activeOption = localeOptions.find((option) => option.code === locale) ?? localeOptions[0];

 return (
 <label className="relative flex h-11 w-[76px] shrink-0 cursor-pointer items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 transition-colors hover:border-red-500 hover:text-red-600 md:h-10 md:w-[82px]" title={translate(locale, 'Language')}>
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
 <path strokeLinecap="round" strokeWidth="1.7" d="M3.5 12h17M12 3c2.4 2.45 3.6 5.45 3.6 9S14.4 18.55 12 21M12 3C9.6 5.45 8.4 8.45 8.4 12s1.2 6.55 3.6 9" />
 </svg>
 <span className="text-[11px] font-black tracking-wider">{activeOption.shortLabel}</span>
 <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
 </svg>
 <select
 value={locale}
 onChange={(event) => onChange(event.target.value as Locale)}
 className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
 aria-label={translate(locale, 'Language')}
 >
 {localeOptions.map((option) => (
 <option key={option.code} value={option.code}>{option.label}</option>
 ))}
 </select>
 </label>
 );
}

function ContactMethods({ locale, contacts, email }: { locale: Locale; contacts: WhatsAppContact[]; email: string }) {
 return (
 <>
 {contacts.map((contact) => (
 <a
 key={contact.whatsappNumber}
 href={`https://wa.me/${contact.whatsappNumber}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-start gap-6 group"
 aria-label={`${translate(locale, 'Chat with')} ${contact.name} ${translate(locale, 'on WhatsApp at')} ${contact.displayNumber}`}
 >
 <span className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-[#128c4a] group-hover:bg-[#25D366] group-hover:border-[#25D366] group-hover:text-white transition-colors duration-300 shrink-0 shadow-sm">
 <WhatsAppIcon />
 </span>
 <span>
 <span className="block text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1 group-hover:text-[#128c4a] transition-colors">WhatsApp · {contact.name}</span>
 <span className="block text-lg font-bold text-slate-900 group-hover:text-[#128c4a] transition-colors">{contact.displayNumber}</span>
 </span>
 </a>
 ))}
 <a href={`mailto:${email}`} className="flex items-start gap-6 group" aria-label={`Email ${email}`}>
 <span className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-colors duration-300 shrink-0 shadow-sm">
 <EmailIcon />
 </span>
 <span>
 <span className="block text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1 group-hover:text-red-600 transition-colors">{translate(locale, 'Email')}</span>
 <span className="block text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors break-all">{email}</span>
 </span>
 </a>
 </>
 );
}

// 服务支持区数据 (首页与服务页共用)
const servicesData: Service[] = [
 {
 title: 'Standard & OEM Manufacturing',
 tagline: 'Built to Your Requirements.',
 img: '/img/services/standard-oem.jpg',
 desc: 'We manufacture a full range of standard and OEM fasteners, supporting international standards as well as customer drawings for engineering, construction, new energy, steel structure, machinery and other industries.',
 icon: (
 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
 </svg>
 )
 },
 {
 title: 'Reliable Production',
 tagline: 'Consistency in Every Batch.',
 img: '/img/services/production-machining.jpg',
 desc: 'Complete production lines, advanced processing equipment and experienced manufacturing teams help us maintain stable product performance, consistent dimensions and dependable delivery schedules.',
 icon: (
 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 )
 },
 {
 title: 'Strict Quality Control',
 tagline: 'Quality at Every Stage.',
 img: '/img/services/quality-control.jpg',
 desc: 'Our quality control system covers production and inspection to ensure that each order meets the agreed standard, dimensional and performance requirements before delivery.',
 icon: (
 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
 </svg>
 )
 },
 {
 title: 'Surface Treatment Options',
 tagline: 'Protection for Every Environment.',
 img: '/img/services/surface-treatment.jpg',
 desc: 'Choose from hot-dip galvanizing, electro-galvanizing, blackening, Dacromet and mechanical galvanizing to meet different appearance and anti-corrosion requirements.',
 icon: (
 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 )
 }
];

// 产品场景区数据
const scenariosData = [
 {
 id: "01",
 title: "Construction & Infrastructure",
 desc: "Standard and customized fastening solutions for building, infrastructure and engineering projects.",
 bgImg: "/img/lanchuang/anchor-wedge-1.png",
 },
 {
 id: "02",
 title: "Automotive & Transportation",
 desc: "Reliable fasteners and machined components for automotive, transport and mobility applications.",
 bgImg: "/img/applications/automotive-machining.jpg",
 },
 {
 id: "03",
 title: "Machinery & Equipment",
 desc: "Consistent industrial fasteners and flange components for equipment manufacturing and assembly.",
 bgImg: "/img/applications/flange-components.jpg",
 },
 {
 id: "04",
 title: "Electronics & Electrical",
 desc: "Precision-manufactured components supported by controlled measurement and quality inspection.",
 bgImg: "/img/applications/quality-measurement.jpg",
 },
 {
 id: "05",
 title: "Rail & Infrastructure",
 desc: "Durable flange and fastening components supplied for rail, infrastructure and heavy-duty projects.",
 bgImg: "/img/applications/lap-joint-flanges.jpg",
 },
 {
 id: "06",
 title: "Custom / OEM Projects",
 desc: "Customer-specific parts made to drawings, dimensions, materials and finish requirements.",
 bgImg: "/img/applications/custom-oem-quality.jpg",
 }
];

const heroSlides = [
 {
 src: '/img/hero/metal-fabrication.jpg',
 alt: 'Industrial metal fabrication with precision grinding',
 position: 'object-center',
 },
 {
 src: '/img/hero/precision-engineering.jpg',
 alt: 'Precision engineering drawings and industrial design tools',
 position: 'object-center',
 },
 {
 src: '/img/hero/industrial-equipment.jpg',
 alt: 'Modern industrial production equipment and metal pipework',
 position: 'object-center',
 },
];

export default function Home() {
 const [managedContent, setManagedContent] = useState<ManagedContent | null>(null);
 const [locale, setLocale] = useState<Locale>('en');
 const [currentId, setCurrentId] = useState('home');
 const [activeScenario, setActiveScenario] = useState(0);
 const [activeCategory, setActiveCategory] = useState('All');
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [selectedServiceDetail, setSelectedServiceDetail] = useState<(Service & { index: number }) | null>(null);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [activeHeroSlide, setActiveHeroSlide] = useState(0);
 const [heroPaused, setHeroPaused] = useState(false);
 const isTransitioning = useRef(false);
 const stageRef = useRef<HTMLDivElement>(null);
 const lenisRef = useRef<Lenis | null>(null);
 const detailContentRef = useRef<HTMLDivElement>(null);
 const transitionToRef = useRef<((id: string, skip?: boolean) => void) | null>(null);
 const localeInitializedRef = useRef(false);
 const t = useCallback((source: string) => translate(locale, source), [locale]);

 useEffect(() => {
 let active = true;
 fetch('/api/content', { cache: 'no-store' })
 .then((response) => response.ok ? response.json() : Promise.reject(new Error('Content request failed')))
 .then((nextContent: ManagedContent) => { if (active) setManagedContent(nextContent); })
 .catch(() => { /* Keep the bundled content available if the API is temporarily unavailable. */ });
 return () => { active = false; };
 }, []);

 const categoryRecords = managedContent?.categories ?? categoryCards.map((category, index) => ({ id: `fallback-${index}`, name: category.name, image: category.image }));
 const categories = categoryRecords.map((category) => category.name);
 const products: Product[] = managedContent
 ? managedContent.products.map((product) => ({
 Category: categoryRecords.find((category) => category.id === product.categoryId)?.name || categories[0] || 'Other',
 'Product Name': product.name,
 Thumbnail: product.thumbnail,
 'Description HTML': product.descriptionHtml,
 }))
 : rawProducts.slice().sort((firstProduct, secondProduct) => categoryOrder.indexOf(firstProduct.Category) - categoryOrder.indexOf(secondProduct.Category));
 const categoryCardsManaged = categoryRecords.map((category) => ({ name: category.name, image: category.image || products.find((product) => product.Category === category.name)?.Thumbnail || '/img/lanchuang/factory-1.jpg' }));
 const whatsappContacts = managedContent?.contacts ?? [
 { id: 'white-cheng', name: 'White Cheng', displayNumber: '+86 133 3310 5125', whatsappNumber: '8613333105125' },
 { id: 'ava', name: 'Ava', displayNumber: '+86 177 3100 7148', whatsappNumber: '8617731007148' },
 { id: 'flynn', name: 'Flynn', displayNumber: '+86 152 3209 0227', whatsappNumber: '8615232090227' },
 ];
 const contactEmail = managedContent?.site.email || 'info@handanbolt.com';
 const siteLogo = managedContent?.site.logo || '/img/lanchuang/logo.jpg?v=20260728-1';
 const siteName = managedContent?.site.name || 'Lan Chuang Fasteners';
 const managedSocialLinks = (managedContent?.socials ?? socialLinks.map((social) => ({ ...social, url: social.href }))).map((social) => ({ id: social.id, label: social.label, href: social.url }));
 const imageFor = (id: string, fallback: string) => managedContent?.images.find((image) => image.id === id)?.url || fallback;
 const managedServicesData = servicesData.map((service, index) => ({ ...service, img: imageFor(`home.service.${index + 1}`, service.img) }));
 const managedScenariosData = scenariosData.map((scenario, index) => ({ ...scenario, bgImg: imageFor(`home.application.${index + 1}`, scenario.bgImg) }));
 const managedHeroSlides = heroSlides.map((slide, index) => ({ ...slide, src: imageFor(`home.hero.${index + 1}`, slide.src) }));

 useEffect(() => {
 document.title = siteName;
 }, [siteName]);

 useEffect(() => {
 let nextLocale = locale;
 if (!localeInitializedRef.current) {
 localeInitializedRef.current = true;
 const savedLocale = window.localStorage.getItem('lanchuang-locale');
 if (isLocale(savedLocale)) nextLocale = savedLocale;
 }

 document.documentElement.lang = nextLocale;
 document.documentElement.dir = isRtlLocale(nextLocale) ? 'rtl' : 'ltr';
 window.localStorage.setItem('lanchuang-locale', nextLocale);
 if (nextLocale !== locale) setLocale(nextLocale);
 }, [locale]);

 const filteredProducts = activeCategory === 'All' 
 ? products
 : products.filter((product) => product.Category === activeCategory);

 useEffect(() => {
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if (heroPaused || reducedMotion) return;

 const timer = window.setInterval(() => {
 setActiveHeroSlide((slide) => (slide + 1) % managedHeroSlides.length);
 }, 6000);

 return () => window.clearInterval(timer);
 }, [heroPaused, managedHeroSlides.length]);

 const changeHeroSlide = (direction: number) => {
 setActiveHeroSlide((slide) => (slide + direction + managedHeroSlides.length) % managedHeroSlides.length);
 };

 // 初始化阻尼滚动 (Lenis 动态绑定到当前页面)
 useEffect(() => {
 let rafId: number;
 const pageNode = document.querySelector(`#${currentId} > .page`);
 const contentNode = document.querySelector(`#${currentId} .scroll-content`);
 
 if (pageNode && contentNode) {
 pageNode.scrollTop = 0; // 切换页面时强制回到顶部
 
 lenisRef.current = new Lenis({
 wrapper: pageNode as HTMLElement,
 content: contentNode as HTMLElement,
 eventsTarget: window,
 lerp: 0.08,
 wheelMultiplier: 1.2,
 });

 const raf = (time: number) => {
 lenisRef.current?.raf(time);
 rafId = requestAnimationFrame(raf);
 };
 rafId = requestAnimationFrame(raf);
 }

 return () => {
 if (rafId) cancelAnimationFrame(rafId);
 if (lenisRef.current) {
 lenisRef.current.destroy();
 lenisRef.current = null;
 }
 };
 }, [currentId]);

 // 处理产品详情页的富文本图片懒加载修复 + 加载失败自动隐藏
 useEffect(() => {
 if (currentId === 'product-detail' && detailContentRef.current) {
 const images = detailContentRef.current.querySelectorAll('img');
 images.forEach(img => {
 const realSrc = img.getAttribute('data-src') || img.getAttribute('data-webp');
 if (realSrc) {
 img.src = realSrc;
 img.removeAttribute('data-src');
 img.removeAttribute('data-webp');
 img.classList.remove('lazyload');
 }
 // 加载失败 (图片被本地删除) 时隐藏该图片所在的段落
 img.onerror = () => {
 const wrapper = img.closest('p, figure, div') as HTMLElement | null;
 if (wrapper && wrapper !== detailContentRef.current) {
 wrapper.style.display = 'none';
 } else {
 img.style.display = 'none';
 }
 };
 });
 }
 }, [currentId, selectedProduct]);

 // 浏览器前进/后退按钮集成：初始写入 home 状态 + 监听 popstate
 useEffect(() => {
 if (typeof window === 'undefined') return;
 // 初始替换当前历史项，避免首次 back 直接离开站点
 if (!window.history.state || !window.history.state.pageId) {
 window.history.replaceState({ pageId: 'home' }, '', window.location.pathname);
 }
 const handlePop = (e: PopStateEvent) => {
 const targetId = e.state?.pageId || 'home';
 transitionToRef.current?.(targetId, true);
 };
 window.addEventListener('popstate', handlePop);
 return () => window.removeEventListener('popstate', handlePop);
 }, []);

 // 用 ref 承载 transitionTo，供 popstate 监听器拿到最新版本
 const transitionTo = useCallback((targetId: string, skipHistory = false) => {
 if (targetId === currentId || isTransitioning.current) return;
 isTransitioning.current = true;

 const outPage = document.getElementById(currentId);
 const inPage = document.getElementById(targetId);

 // 将页面切换写入浏览器历史，使后退按钮可在网站内回退
 if (!skipHistory && typeof window !== 'undefined') {
 window.history.pushState({ pageId: targetId }, '', `#${targetId}`);
 }

 setCurrentId(targetId);

 // 1. 2D 极简入场位置
 gsap.set(inPage, {
 display: 'block',
 x: '50vw',
 opacity: 0
 });

 const tl = gsap.timeline({
 onComplete: () => {
 gsap.set(outPage, { display: 'none' });
 isTransitioning.current = false;
 }
 });

 // 2. 出场页面简单左移淡出
 tl.to(outPage, {
 x: '-20vw',
 opacity: 0,
 duration: 0.8,
 ease: "power3.inOut"
 }, 0);

 // 3. 入场页面顺滑滑入
 tl.to(inPage, {
 x: '0%',
 opacity: 1,
 duration: 0.8,
 ease: "power3.inOut" 
 }, 0.1);
 }, [currentId]);

 // 每次渲染同步最新 transitionTo 到 ref
 useEffect(() => {
 transitionToRef.current = transitionTo;
 }, [transitionTo]);

 const navItems = [
 { id: 'home', label: 'Home' },
 { id: 'about', label: 'About Us' },
 { id: 'products', label: 'Products', hasMegaMenu: true },
 { id: 'services', label: 'Services' },
 { id: 'contact', label: 'Contact Us' },
 ];

 // 提取全局复用的 Footer 组件
 const renderFooter = () => (
 <footer className="w-full bg-slate-50 py-16 px-6 md:py-24 md:px-12 border-t border-slate-200 z-20 relative">
 <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
 
 {/* 列 1: 品牌与引导 */}
 <div className="w-full flex flex-col items-start">
          <img src={siteLogo} alt={siteName} className="w-full max-w-[190px] md:max-w-[230px] h-auto object-contain mb-6 mix-blend-multiply" />
 <h4 className="text-base font-bold text-slate-900 mb-2">{t("Are you ready to get started?")}</h4>
 <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">{t("Contact us to tailor the most suitable product for your business.")}</p>
 <button onClick={() => transitionTo('contact')} className="bg-red-600 text-white px-8 py-3 font-bold text-[10px] tracking-widest hover:bg-red-700 hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 group">
 {t("CONTACT US")}
 <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
 </button>
 <div className="mt-7">
 <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Follow Us")}</p>
 <div className="flex flex-wrap items-center gap-2" aria-label={t("Social media")}>
 {managedSocialLinks.map((social) => social.href ? (
 <a
 key={social.id}
 href={social.href}
 target="_blank"
 rel="noopener noreferrer"
 aria-label={social.label}
 title={social.label}
 className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20"
 >
 <SocialIcon id={social.id} />
 </a>
 ) : (
 <button
 key={social.id}
 type="button"
 disabled
 aria-label={`${social.label} ${t('link coming soon')}`}
 title={`${social.label} ${t('link coming soon')}`}
 className="flex h-9 w-9 cursor-default items-center justify-center border border-slate-200 bg-white text-slate-400"
 >
 <SocialIcon id={social.id} />
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* 列 2: Products 菜单 */}
 <div className="w-full flex flex-col items-start lg:pl-10">
 <h4 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">{t("PRODUCTS")}</h4>
 <ul className="flex flex-col gap-4">
 {categories.map((cat, i) => (
 <li key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => { setActiveCategory(cat as string); transitionTo('products'); }}>
 <span className="text-red-600 font-black text-sm transform group-hover:translate-x-1 transition-transform duration-300">&rsaquo;</span>
 <span className="text-[13px] text-slate-500 font-medium group-hover:text-red-600 transition-colors duration-300 capitalize">{t(cat as string)}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* 列 3: Information 菜单 */}
 <div className="w-full flex flex-col items-start">
 <h4 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">{t("INFORMATION")}</h4>
 <ul className="flex flex-col gap-4">
 {[
 { label: 'About Us', target: 'about' },
 { label: 'Services', target: 'services' },
 { label: 'Contact Us', target: 'contact' },
 ].map((item, i) => (
 <li key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => transitionTo(item.target)}>
 <span className="text-red-600 font-black text-sm transform group-hover:translate-x-1 transition-transform duration-300">&rsaquo;</span>
 <span className="text-[13px] text-slate-500 font-medium group-hover:text-red-600 transition-colors duration-300">{t(item.label)}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* 列 4: Contact Us 联系信息 */}
 <div className="w-full flex flex-col items-start">
 <h4 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">{t("CONTACT US")}</h4>
 <ul className="flex flex-col gap-6">
 <li className="flex items-start gap-4 group">
 <svg className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors duration-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
 <span className="text-[13px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-900 transition-colors duration-300">
 {t("West Zone 3-46, Hebeipu Standard Parts Industrial City,")}<br/>{t("Linmingguan Town, Yongnian District,")}<br/>{t("Handan, Hebei, China")}
 </span>
 </li>
 {whatsappContacts.map((contact) => (
 <li key={contact.id || contact.whatsappNumber} className="flex items-center gap-4 group">
 <WhatsAppIcon className="w-5 h-5 text-[#128c4a] shrink-0" />
 <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-slate-500 font-medium group-hover:text-[#128c4a] transition-colors duration-300" aria-label={`${t('Chat with')} ${contact.name}`}>{contact.name}: {contact.displayNumber}</a>
 </li>
 ))}
 <li className="flex items-center gap-4 group">
 <EmailIcon className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
 <a href={`mailto:${contactEmail}`} className="text-[13px] text-slate-500 font-medium group-hover:text-red-600 transition-colors duration-300 break-all">{contactEmail}</a>
 </li>
 </ul>
 </div>
 </div>

 {/* Copyright 底部版权条 */}
 <div className="w-full max-w-[1400px] mx-auto mt-12 md:mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-0">
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{t("© 2026 Handan Lanchuang Fastener Manufacturing Co., Ltd. All Rights Reserved.")}</p>
 <div className="flex flex-wrap items-center gap-5 md:gap-8">
 <span className="text-[10px] text-slate-400 font-bold hover:text-red-600 cursor-pointer uppercase tracking-widest transition-colors">{t("Privacy Policy")}</span>
 <span className="text-[10px] text-slate-400 font-bold hover:text-red-600 cursor-pointer uppercase tracking-widest transition-colors">{t("Terms of Service")}</span>
 </div>
 </div>
 </footer>
 );

 return (
 <>
 <div className="motion-overlay" id="blur-layer"></div>

 {/* 顶部导航栏 - 亮色玻璃态 */}
 <nav dir="ltr" className="fixed top-0 left-0 w-full h-[72px] md:h-auto z-[1000] flex justify-between items-center gap-3 px-5 md:px-12 py-0 md:py-2 bg-white border-b border-slate-200 transition-all duration-500 shadow-sm">
 <div className="cursor-pointer -ml-2 md:-ml-6" onClick={() => transitionTo('home')}>
        <img src={siteLogo} alt={siteName} className="h-12 md:h-20 w-auto max-w-[170px] md:max-w-[210px] object-contain mix-blend-multiply" />
 </div>
 
 {/* 桌面端导航 */}
 <ul className="hidden lg:flex items-center gap-5 xl:gap-10">
 {navItems.map((item) => (
 <li 
 key={item.id}
 className={`relative group cursor-pointer text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] xl:tracking-[0.15em] transition-colors duration-300 ${currentId === item.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
 >
 <div onClick={() => transitionTo(item.id)} className="py-2">
 {t(item.label)}
 </div>
 
 {/* 超级菜单 (Mega Menu) */}
 {item.hasMegaMenu && (
 <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 translate-y-4 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-500 ease-out">
 <div className="bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-8 w-[600px]">
 <div className="text-[10px] text-slate-400 mb-6 border-b border-slate-100 pb-4 tracking-widest font-bold">{t("EXPLORE OUR CATEGORIES")}</div>
 <div className="grid grid-cols-2 gap-x-8 gap-y-5">
 {categories.map((cat, idx) => (
 <div 
 key={idx} 
 className="text-sm text-slate-600 hover:text-red-600 hover:translate-x-1 transition-all duration-300 cursor-pointer capitalize font-semibold tracking-normal"
 onClick={() => { setActiveCategory(cat as string); transitionTo('products'); }}
 >
 {t(cat as string)}
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* 当前选中状态指示器 - 红色 */}
 <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 transition-all duration-300 ${currentId === item.id ? 'opacity-100 shadow-[0_0_8px_rgba(220,38,38,0.8)] scale-100' : 'opacity-0 scale-0'}`}></div>
 </li>
 ))}
 </ul>

 {/* 移动端汉堡菜单按钮 */}
 <div className="flex items-center gap-2">
 <LanguageSwitcher locale={locale} onChange={(nextLocale) => { setLocale(nextLocale); setMobileMenuOpen(false); }} />
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] focus:outline-none"
 aria-label={t("Toggle menu")}
 >
 <span className={`w-6 h-[2px] bg-slate-900 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
 <span className={`w-6 h-[2px] bg-slate-900 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
 <span className={`w-6 h-[2px] bg-slate-900 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
 </button>

 {/* 移动端展开菜单面板 */}
 </div>
 <div className={`lg:hidden fixed top-[72px] md:top-[96px] left-0 w-full bg-white border-b border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 origin-top ${mobileMenuOpen ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-0'}`}>
 <ul className="flex flex-col py-4">
 {navItems.map((item) => (
 <li
 key={item.id}
 onClick={() => { transitionTo(item.id); setMobileMenuOpen(false); }}
 className={`px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] cursor-pointer border-l-4 transition-all duration-300 ${currentId === item.id ? 'text-red-600 border-red-600 bg-red-50' : 'text-slate-700 border-transparent hover:bg-slate-50 hover:text-red-600'}`}
 >
 {t(item.label)}
 </li>
 ))}
 </ul>
 </div>
 </nav>

 <div className="viewport" dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}>
 <div className="stage" ref={stageRef} id="main-stage">
 
 {/* 页面 01: Home (全屏英雄区 + Product Series) */}
 <div id="home" className="page-wrapper" style={{ display: 'block' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#ffffff', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none">

 {/* 第一屏：全屏英雄区 */}
 <div
 className="relative w-full h-[calc(100svh-88px)] min-h-[560px] max-h-[760px] mt-[72px] md:mt-0 md:h-screen md:min-h-0 md:max-h-none overflow-hidden flex items-center flex-none bg-[#060913]"
 onMouseEnter={() => setHeroPaused(true)}
 onMouseLeave={() => setHeroPaused(false)}
 >
 {/* 高清沙滩风景背景 */}
 <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
 {managedHeroSlides.map((slide, index) => (
 <img
 key={slide.src}
 src={slide.src}
 alt={t(slide.alt)}
 className={`absolute inset-0 w-full h-full object-cover ${slide.position} transition-[opacity,transform] duration-[1400ms] ease-out ${activeHeroSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]'}`}
 aria-hidden={activeHeroSlide !== index}
 />
 ))}
 {/* 整体亮度遮罩层 */}
 <div className="absolute inset-0 bg-black/30"></div>
 {/* 左侧深色径向渐变，提升文字对比 */}
 <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
 </div>
 
 <div className="hero-content relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between h-full pt-0 md:pt-16 pb-20 md:pb-0 will-change-transform">
 
 {/* 左侧：文案内容区 */}
 <div className="flex flex-col items-start text-left w-full lg:w-[60%]">
 <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold text-blue-300 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-5 md:mb-8 leading-relaxed">
 <div className="w-6 md:w-8 h-[2px] bg-blue-300 shrink-0"></div>
 {t("Professional Fastener Manufacturing")}
 </div>
 
 <h1 className="mb-5 md:mb-8 text-blue-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-[1.65rem] md:text-3xl lg:text-[2.5rem] leading-[1.2] font-black tracking-tight max-w-3xl">
 {t("Fasteners Built for Strength. Partnerships Built to Last.")}
 </h1>
 
 <p className="text-blue-100 text-sm md:text-base leading-7 md:leading-relaxed max-w-2xl mb-7 md:mb-12 tracking-normal md:tracking-wide font-[family-name:var(--font-inter)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
 {t("We manufacture standard and OEM bolts, nuts, anchors, threaded rods, washers and customized metal components for global engineering and industrial customers.")}
 </p>
 
 <div className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full sm:w-auto max-w-[360px] sm:max-w-none">
 <button 
 onClick={() => transitionTo('products')}
 className="w-full sm:w-auto min-h-13 px-6 md:px-10 py-3.5 md:py-4 bg-white text-black text-[11px] md:text-xs font-bold tracking-[0.14em] md:tracking-[0.2em] whitespace-nowrap uppercase hover:bg-blue-50 hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all duration-500 ease-out"
 >
 {t("Explore Our Products")}
 </button>
 <button 
 onClick={() => transitionTo('about')}
 className="w-full sm:w-auto min-h-13 px-6 md:px-10 py-3.5 md:py-4 bg-black/20 backdrop-blur-md text-white border border-white/30 text-[11px] md:text-xs font-bold tracking-[0.14em] md:tracking-[0.2em] whitespace-nowrap uppercase hover:border-white hover:bg-white/10 transition-all duration-500 ease-out"
 >
 {t("Our Expertise")}
 </button>
 </div>
 </div>
 
 </div>
 
 
 {/* 向下滚动提示 */}
 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center animate-bounce opacity-50">
 <div className="text-[9px] text-white tracking-[0.3em] uppercase mb-3">{t("Scroll")}</div>
 <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
 </div>

 <div className="absolute right-5 md:right-12 bottom-5 md:bottom-14 z-30 flex items-center gap-2 md:gap-4">
 <button
 type="button"
 onClick={() => changeHeroSlide(-1)}
 className="w-11 h-11 md:w-12 md:h-12 border border-white/35 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all duration-300"
 aria-label={t("Previous hero image")}
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" /></svg>
 </button>

 <div className="hidden sm:flex items-center gap-3 px-4 h-11 md:h-12 bg-black/20 border border-white/25 backdrop-blur-md">
 {managedHeroSlides.map((slide, index) => (
 <button
 key={slide.src}
 type="button"
 onClick={() => setActiveHeroSlide(index)}
 className={`h-[2px] transition-all duration-500 ${activeHeroSlide === index ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/70'}`}
 aria-label={`${t('Show hero image')} ${index + 1}`}
 aria-current={activeHeroSlide === index ? 'true' : undefined}
 />
 ))}
 <span className="ml-1 text-[10px] font-bold tracking-[0.2em] text-white tabular-nums">0{activeHeroSlide + 1} / 0{managedHeroSlides.length}</span>
 </div>

 <button
 type="button"
 onClick={() => changeHeroSlide(1)}
 className="w-11 h-11 md:w-12 md:h-12 border border-white/35 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all duration-300"
 aria-label={t("Next hero image")}
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
 </button>
 </div>
 </div>

 {/* 第二屏：Product Series 分类展示区 (Light Theme) */}
 <div className="relative w-full bg-gradient-to-b from-slate-50 to-white pt-12 pb-16 px-6 md:px-12 z-20 flex flex-col items-center">
 <h2 className="text-3xl md:text-[clamp(2.5rem,5vw,4rem)] font-black font-yahei text-slate-900 mb-8 md:mb-10 text-center tracking-tighter leading-none">
 {t("Products")}
 </h2>
 
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 w-full max-w-[1200px]">
 {categoryCardsManaged.map((cat, idx) => (
 <div 
 key={idx} 
 className="group relative w-full aspect-[4/5] cursor-pointer"
 onClick={() => { setActiveCategory(cat.name); transitionTo('products'); }}
 >
 <div className="absolute inset-0 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-white transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)] group-hover:border group-hover:border-red-600/20">
 {/* 背景图：产品品类代表图，悬停时完全清晰 */}
 <img 
 src={cat.image} 
 alt={t(cat.name)}
 className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80 group-hover:opacity-100"
 />
 {/* 黑色底部渐变遮罩，保证文字清晰 (即使在白底主题下，图片上的文字通常也需要暗色遮罩) */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#060913]/90 via-[#060913]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"></div>
 
 {/* 文字内容 */}
 <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex justify-between items-end gap-2 pointer-events-none">
 <div>
 <div className="text-[8px] md:text-[9px] text-red-400 tracking-[0.15em] md:tracking-[0.2em] uppercase mb-2 md:mb-3">{t("Series")} {(idx + 1).toString().padStart(2, '0')}</div>
 <h3 className="text-sm sm:text-base md:text-xl font-bold text-white tracking-normal md:tracking-wide capitalize group-hover:text-red-50 transition-colors duration-500 leading-tight">
 {t(cat.name)}
 </h3>
 </div>
 {/* 箭头悬停特效 (改用红色基调) */}
 <div className="w-9 h-9 md:w-12 md:h-12 border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500 transform group-hover:translate-x-2 shrink-0">
 <svg className="w-4 h-4 md:w-5 md:h-5 text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* 第三屏：企业介绍区 (Corporate Intro) - 深色主题 */}
 <div className="relative w-full bg-[#0a0f1c] py-16 px-6 md:py-24 md:px-12 z-20 flex flex-col items-center overflow-hidden">
 {/* 背景光晕装饰 */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden">
 <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[80%] bg-red-600/10 blur-[140px] "></div>
 <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[70%] bg-blue-600/10 blur-[140px] "></div>
 </div>

 <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
 
 {/* 左侧：企业视频 */}
 <div className="w-full lg:w-[55%] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/10">
 <video
 autoPlay
 muted
 loop
 playsInline
 preload="metadata"
 poster={imageFor('home.whoWeAre.poster', '/img/lanchuang/factory-2.jpg')}
 aria-label={t("Handan Lanchuang fastener production")}
 className="w-full aspect-[16/10] object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
 >
 <source src="/video/company-profile.mp4" type="video/mp4" />
 </video>
 <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f1c]/50 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-700 pointer-events-none"></div>
 </div>
 
 {/* 右侧：企业文案 */}
 <div className="w-full lg:w-[45%] flex flex-col items-start relative pl-0 lg:pl-10">
 <span className="text-[10px] font-bold text-red-500 tracking-[0.4em] uppercase mb-4">{t("Who We Are")}</span>
 <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 md:mb-8 leading-tight">
 {t("Handan Lanchuang Fastener")}<br/>{t("Manufacturing Co., Ltd.")}
 </h3>
 
 <div className="text-slate-300 leading-relaxed text-sm md:text-base font-medium flex flex-col gap-4">
 <p>
 {t("Located in Yongnian District, Handan City, Hebei Province, Handan Lanchuang Fastener Manufacturing Co., Ltd. is a professional manufacturer and supplier in China's largest fastener industrial cluster.")}
 </p>
 <p>
 {t("We produce a full range of standard and OEM fasteners for engineering, construction, new energy, steel structure, machinery and other industries. Complete production lines and strict quality control help us deliver reliable products, competitive prices and efficient service.")}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* 红色数据指标 Banner */}
 <div className="relative w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 py-10 px-6 md:py-16 md:px-12 z-20 overflow-hidden">
 {/* 装饰几何 */}
 <div className="absolute inset-0 pointer-events-none opacity-20">
 <div className="absolute -top-24 -right-24 w-96 h-96 border-[3px] border-white/30 "></div>
 <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] border-[3px] border-white/20 "></div>
 </div>

 <div className="relative w-full max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-8">
 {[
 { num: 'GB', label: 'China Standards' },
 { num: 'DIN', label: 'German Standards' },
 { num: 'ANSI', label: 'American Standards' },
 { num: 'ISO', label: 'Global Standards' },
 ].map((stat, idx) => (
 <div key={idx} className={`flex flex-col items-center text-center border-white/20 px-2 md:px-4 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 3 ? 'md:border-r' : 'md:border-r-0'}`}>
 <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">{stat.num}</div>
 <div className="text-[9px] md:text-[11px] text-red-100 font-bold tracking-[0.15em] md:tracking-[0.25em] uppercase leading-relaxed">{t(stat.label)}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Our Services 卡片区 */}
 <div className="relative w-full bg-gradient-to-b from-slate-100 via-white to-slate-50 pt-12 pb-16 md:pt-14 md:pb-20 px-6 md:px-12 z-20 flex flex-col items-center">
 <h2 className="text-3xl md:text-[clamp(2rem,4vw,3.25rem)] font-black font-yahei text-slate-900 mb-8 md:mb-10 text-center tracking-tighter leading-none">
 {t("Services")}
 </h2>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8 w-full max-w-[1600px]">
 {managedServicesData.map((svc, idx) => (
 <div
 key={idx}
 onClick={() => { setSelectedServiceDetail({ ...svc, index: idx }); transitionTo('service-detail'); }}
 className="group relative w-full aspect-[4/5] cursor-pointer"
 >
 <div className="absolute inset-0 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-white border border-slate-100 transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-[0_25px_55px_rgba(220,38,38,0.15)] group-hover:border-red-600/30">
 <img
 src={svc.img}
 alt={t(svc.title)}
 className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[#060913]/90 via-[#060913]/30 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"></div>

 <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex justify-between items-end gap-2 pointer-events-none">
 <div>
 <div className="text-[8px] md:text-[10px] font-bold text-red-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-2 md:mb-3">0{idx + 1}</div>
 <h3 className="text-white text-sm sm:text-base md:text-2xl font-black tracking-tight leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
 {t(svc.title)}
 </h3>
 </div>
 <div className="w-9 h-9 md:w-10 md:h-10 border border-white/60 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:border-red-600 transition-colors duration-500">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* 第六屏：Usage Scenarios (6 张图一列 + 点击放大预览) */}
 <div className="relative w-full bg-gradient-to-b from-slate-50 to-white py-16 px-6 md:py-20 md:px-12 z-20 flex flex-col items-center">
 {/* 居中标题 */}
 <h2 className="text-3xl md:text-[clamp(2rem,4vw,3.25rem)] font-black font-yahei text-slate-900 text-center tracking-tighter leading-tight md:leading-none mb-4">
 {t("Industry Applications")}
 </h2>
 <p className="text-slate-500 text-sm md:text-base text-center max-w-2xl mb-8 md:mb-12 font-medium leading-relaxed">
 {t("Fastener solutions for demanding projects, with standard and customized production support.")}
 </p>

 {/* 主显示区：左侧 6 张缩略图（同一列）+ 右侧放大预览 */}
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch">
 {/* 左侧：缩略图列表 (桌面端整列高度与右侧预览一致) */}
 <div className="w-full lg:w-[220px] shrink-0 grid grid-cols-3 sm:grid-cols-6 lg:flex lg:flex-col gap-2 sm:gap-3 lg:h-[520px]">
 {managedScenariosData.map((scenario, idx) => {
 const isActive = activeScenario === idx;
 return (
 <div
 key={idx}
 onClick={() => setActiveScenario(idx)}
 className={`relative w-full h-[72px] sm:h-[80px] lg:h-auto lg:flex-1 cursor-pointer overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-red-600 shadow-[0_10px_20px_rgba(220,38,38,0.25)] scale-[1.02]' : 'border-transparent hover:border-red-300 opacity-70 hover:opacity-100'}`}
 >
 <img src={scenario.bgImg} alt={t(scenario.title)} className="w-full h-full object-cover" />
 <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
 <div className={`absolute top-1 left-2 text-[10px] font-black tracking-widest ${isActive ? 'text-red-600' : 'text-white'}`}>{scenario.id}</div>
 </div>
 );
 })}
 </div>

 {/* 右侧：放大预览 */}
 <div className="w-full flex-none lg:flex-1 relative h-[240px] sm:h-[360px] lg:h-[520px] overflow-hidden bg-black">
 {managedScenariosData.map((scenario, idx) => (
 <div
 key={idx}
 className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${activeScenario === idx ? 'opacity-100' : 'opacity-0'}`}
 >
 <img src={scenario.bgImg} alt={t(scenario.title)} className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-gradient-to-t from-[#060913]/85 via-[#060913]/10 to-transparent"></div>
 <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 text-white">
 <div className="text-[9px] font-bold tracking-[0.25em] text-red-400 mb-2">{t("APPLICATION")} {scenario.id}</div>
 <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 leading-tight">{t(scenario.title)}</h3>
 <p className="hidden sm:block max-w-xl text-sm text-slate-200 leading-relaxed">{t(scenario.desc)}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* 第七屏：Contact Us (询盘与联系我们) */}
 <div className="relative w-full bg-gradient-to-b from-slate-50 to-white py-16 px-6 md:py-24 md:px-12 z-20 flex flex-col items-center">
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
 
 {/* 左侧：联系信息与标语 */}
 <div className="w-full lg:w-[40%] flex flex-col items-start justify-center">
 <h2 className="text-2xl md:text-3xl font-black font-yahei text-slate-900 mb-5 md:mb-8 tracking-tight leading-tight">
 {t("Let's Start a Conversation")}
 </h2>
 <p className="text-slate-600 leading-relaxed mb-8 md:mb-12 text-sm md:text-base font-medium max-w-md">
 {t("Tell us the product standard, size, finish, quantity or drawing requirements. Our team will help you develop the right standard or OEM fastener solution.")}
 </p>

 <div className="flex flex-col gap-6 md:gap-8 w-full">
 <ContactMethods locale={locale} contacts={whatsappContacts} email={contactEmail} />
 {/* Location */}
 <div className="flex items-start gap-6 group cursor-pointer">
 <div className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-colors duration-300 shrink-0 shadow-sm">
 <svg className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 </div>
 <div>
 <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">{t("Headquarters")}</p>
 <p className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors">{t("West Zone 3-46, Hebeipu Standard Parts Industrial City,")}<br/>{t("Yongnian District, Handan, Hebei, China")}</p>
 </div>
 </div>
 </div>
 </div>

 {/* 右侧：高级询盘表单 */}
 <div className="w-full lg:w-[60%] relative">
 {/* 背景装饰框 */}
 <div className="absolute inset-0 bg-slate-100 transform translate-x-4 translate-y-4 -z-10"></div>
 
 <div className="bg-white p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
 {/* 顶角红色滑动装饰线 */}
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
 
 <h3 className="text-2xl font-bold text-slate-900 mb-8 md:mb-10">{t("Send an Inquiry")}</h3>
 
 <form className="flex flex-col gap-6">
 {/* 姓名与邮箱 */}
 <div className="flex flex-col md:flex-row gap-6">
 <div className="flex-1 relative">
 <input type="text" id="name" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Name")} />
 <label htmlFor="name" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Your Name")}</label>
 </div>
 <div className="flex-1 relative">
 <input type="email" id="email" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Email")} />
 <label htmlFor="email" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Email Address")}</label>
 </div>
 </div>
 
 {/* 意向产品下拉框 */}
 <div className="relative">
 <select id="interest" defaultValue="" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer invalid:text-slate-400">
 <option value="" disabled hidden>{t("Product of Interest")}</option>
 {categories.map((cat) => <option key={cat} value={String(cat).toLowerCase().replaceAll(' ', '-')} className="text-slate-900">{t(cat)}</option>)}
 <option value="oem" className="text-slate-900">{t("OEM / Customized Fasteners")}</option>
 </select>
 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
 </div>
 </div>

 {/* 留言内容区 */}
 <div className="relative">
 <textarea id="message" rows={4} className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent resize-none" placeholder={t("Message")}></textarea>
 <label htmlFor="message" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Project Details or Questions")}</label>
 </div>

 {/* 提交按钮 */}
 <button type="button" className="w-full bg-[#0a0f1c] text-white py-5 font-bold text-sm tracking-widest uppercase hover:bg-red-600 hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mt-4 group">
 {t("SUBMIT INQUIRY")}
 <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
 </button>
 </form>
 </div>
 </div>

 </div>
 </div>

 {/* 第八屏：Footer 底部导航栏 */}
 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 03: Products (产品列表页) */}
 <div id="products" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#f8fafc', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">
 
 {/* 顶部 Banner */}
 <div className="relative w-full h-[34vh] min-h-[240px] md:h-[45vh] bg-[#0a0f1c] flex items-center justify-center overflow-hidden shrink-0 mt-[72px] md:mt-24">
 <div className="absolute inset-0 bg-black/40 z-10"></div>
 <img src={imageFor('products.banner', '/img/lanchuang/factory-1.jpg')} alt={t("Fastener production facility")} className="absolute inset-0 w-full h-full object-cover opacity-60" />
 <div className="relative z-20 text-center px-6 md:px-12">
 <h1 className="text-4xl md:text-7xl font-black font-yahei text-white mb-6 drop-shadow-lg">
 {t("Products")}
 </h1>
 <div className="w-20 h-1 bg-red-600 mx-auto "></div>
 </div>
 </div>

 {/* 核心内容区：左侧分类侧边栏 + 右侧产品网格 */}
 <div className="w-full max-w-[1700px] mx-auto px-6 md:px-8 py-14 md:py-20 flex flex-col lg:flex-row gap-8 flex-1">
 
 {/* 左侧：分类侧边栏 */}
 <div className="w-full lg:w-[200px] shrink-0">
 <div className="lg:sticky lg:top-40 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 p-4 lg:p-5">
 <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-2">
 <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
 {t("Categories")}
 </h3>
 <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
 <li
 onClick={() => setActiveCategory('All')}
 className={`shrink-0 min-w-max px-4 lg:px-3 py-3 cursor-pointer font-bold text-[12px] transition-all duration-300 flex items-center justify-between gap-3 group ${activeCategory === 'All' ? 'bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)]' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
 >
 <span>{t("All Products")}</span>
 <span className={`transform transition-transform duration-300 shrink-0 ${activeCategory === 'All' ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>&rsaquo;</span>
 </li>
 {categories.map((cat, idx) => (
 <li 
 key={idx}
 onClick={() => setActiveCategory(cat as string)}
 className={`shrink-0 min-w-max px-4 lg:px-3 py-3 cursor-pointer font-bold text-[12px] transition-all duration-300 flex items-center justify-between gap-3 group ${activeCategory === cat ? 'bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)]' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
 >
 <span className="capitalize line-clamp-1">{t(cat as string)}</span>
 <span className={`transform transition-transform duration-300 shrink-0 ${activeCategory === cat ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>&rsaquo;</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* 右侧：产品展示网格 */}
 <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8 self-start">
 {filteredProducts.map((prod, idx: number) => (
 <div 
 key={idx} 
 onClick={() => { setSelectedProduct(prod); transitionTo('product-detail'); }}
 className="bg-white border border-slate-100 overflow-hidden group hover:border-red-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col cursor-pointer"
 >
 
 {/* 产品图区 */}
 <div className="w-full aspect-square bg-slate-50 relative overflow-hidden p-4 md:p-8 flex items-center justify-center">
 <img src={prod.Thumbnail || 'https://via.placeholder.com/400?text=No+Image'} className="w-full h-full object-contain mix-blend-multiply" alt={t(prod['Product Name'])} />
 </div>

 {/* 产品信息区 */}
 <div className="px-4 py-4 md:px-7 md:py-6 flex flex-col">
 <div className="text-[8px] md:text-[10px] text-red-500 font-bold uppercase tracking-widest mb-2 md:mb-3">{t(prod.Category)}</div>
 <h3 className="text-sm md:text-lg font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2.6em]">
 {t(prod['Product Name'])}
 </h3>
 </div>

 </div>
 ))}
 
 {/* 无产品状态 */}
 {filteredProducts.length === 0 && (
 <div className="col-span-full py-20 text-center">
 <p className="text-slate-400 text-lg">{t("No products found in this category.")}</p>
 </div>
 )}
 </div>
 
 </div>

 {/* 底部复用 Footer */}
 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 06: Product Detail (产品详情页) */}
 <div id="product-detail" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#f8fafc', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">
 
 {selectedProduct && (
 <>
 {/* 顶部面包屑 */}
 <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-[104px] md:pt-32 pb-6">
 <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-bold text-slate-500 tracking-[0.1em] md:tracking-[0.15em] uppercase">
 <span className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => transitionTo('home')}>{t("Home")}</span>
 <span className="text-slate-300">/</span>
 <span className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => { setActiveCategory(selectedProduct.Category); transitionTo('products'); }}>{t("Products")}</span>
 <span className="text-slate-300">/</span>
 <span className="text-slate-900">{t(selectedProduct.Category)}</span>
 </div>
 </div>

 {/* 主体三栏区 */}
 <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-12 flex flex-col lg:flex-row gap-6 lg:gap-10">

 {/* 左侧：分类列表 + 联系方式 */}
 <aside className="hidden lg:flex w-full lg:w-[230px] shrink-0 flex-col gap-8">
 {/* PRODUCT CENTER */}
 <div className="bg-white border border-slate-200">
 <div className="flex items-center justify-center gap-2 py-4 border-b border-slate-200">
 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>
 <span className="text-[12px] font-bold text-slate-900 tracking-[0.15em] uppercase">{t("Product Center")}</span>
 </div>
 <ul className="flex flex-col">
 {categories.map((cat, idx) => {
 const active = selectedProduct.Category === cat;
 return (
 <li
 key={idx}
 onClick={() => { setActiveCategory(cat as string); transitionTo('products'); }}
 className={`px-5 py-3 text-[12px] cursor-pointer border-t border-slate-100 transition-colors ${active ? 'text-red-600 font-bold' : 'text-slate-700 hover:text-red-600'}`}
 >
 {t(cat as string)}
 </li>
 );
 })}
 </ul>
 </div>

 {/* CONTACT US */}
 <div className="bg-white border border-slate-200">
 <div className="flex items-center justify-center gap-2 py-4 border-b border-slate-200">
 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
 <span className="text-[12px] font-bold text-slate-900 tracking-[0.15em] uppercase">{t("Contact Us")}</span>
 </div>
 <ul className="flex flex-col text-[12px] text-slate-600">
 {whatsappContacts.map((contact) => (
 <li key={contact.id || contact.whatsappNumber} className="px-5 py-3 flex items-center gap-2 border-t border-slate-100">
 <WhatsAppIcon className="w-4 h-4 text-[#128c4a]" />
 <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#128c4a] transition-colors">{contact.name}: {contact.displayNumber}</a>
 </li>
 ))}
 </ul>
 </div>
 </aside>

 {/* 中间：产品主图 */}
 <div className="flex-1 min-w-0">
 <div className="bg-white border border-slate-200 p-4 md:p-6">
 <div className="w-full aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
 <img
 src={selectedProduct.Thumbnail || '/img/lanchuang/factory-1.jpg'}
 alt={t(selectedProduct['Product Name'])}
 className="w-full h-full object-contain"
 />
 </div>
 </div>
 </div>

 {/* 右侧：产品名 + 询盘按钮 */}
 <div className="w-full lg:w-[320px] shrink-0">
 <div className="sticky top-32 flex flex-col">
 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-4">
 {t(selectedProduct['Product Name'])}
 </h1>
 <div className="w-20 h-[2px] bg-red-600 mb-8"></div>

 <div className="flex items-center gap-10 mb-10">
 <button
 onClick={() => transitionTo('contact')}
 className="flex items-center gap-2 text-red-600 font-medium text-sm hover:text-red-700 transition-colors"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
 {t("Contact Us")}
 </button>
 <a
 href={`https://wa.me/${whatsappContacts[0]?.whatsappNumber || '8613333105125'}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-red-600 font-medium text-sm hover:text-red-700 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
 {t("Chat Now")}
 </a>
 </div>

 <button
 onClick={() => transitionTo('contact')}
 className="w-full py-4 bg-red-600 text-white font-bold text-xs tracking-widest hover:bg-red-700 hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all duration-300"
 >
 {t("INQUIRE NOW")}
 </button>
 </div>
 </div>
 </div>

 {/* 下方：产品详情描述 */}
 <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-16 md:pb-24">
 <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
 <div className="w-1 h-6 bg-red-600"></div>
 <h2 className="text-lg font-bold text-slate-900">{t("Product Description")}</h2>
 </div>
 <div
 ref={detailContentRef}
 className="product-html-content"
 dangerouslySetInnerHTML={{
 __html: selectedProduct['Description HTML']
 ? translateProductHtml(locale, selectedProduct['Description HTML'])
 : `<p class="text-slate-500">${t('No detailed description available for this product.')}</p>`
 }}
 />
 </div>
 </>
 )}

 {/* 底部复用 Footer */}
 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 07: Service Detail (服务详情页) */}
 <div id="service-detail" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#ffffff', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">

 {selectedServiceDetail && (
 <>
 {/* 顶部 Banner */}
 <div className="relative w-full h-[46vh] min-h-[360px] md:h-[60vh] bg-[#0a0f1c] flex items-center justify-center overflow-hidden shrink-0 mt-[72px] md:mt-24">
 <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0f1c] z-10"></div>
 <img
 src={selectedServiceDetail.img}
 alt={t(selectedServiceDetail.title)}
 className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm scale-105"
 />

 <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center text-center mt-4 md:mt-12">
 <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-slate-300 tracking-[0.12em] md:tracking-[0.2em] uppercase mb-5 md:mb-8">
 <span className="cursor-pointer hover:text-white transition-colors" onClick={() => transitionTo('home')}>{t("Home")}</span>
 <span className="text-red-500">/</span>
 <span className="text-white">{t("Our Services")}</span>
 <span className="text-red-500">/</span>
 <span className="text-white">0{selectedServiceDetail.index + 1}</span>
 </div>

 <span className="text-red-500 font-bold tracking-[0.3em] uppercase text-xs mb-6 block">{t(selectedServiceDetail.tagline)}</span>
 <h1 className="text-3xl md:text-6xl font-black font-yahei text-white mb-6 tracking-tight max-w-4xl leading-tight drop-shadow-2xl">
 {t(selectedServiceDetail.title)}.
 </h1>
 <div className="w-20 h-1 bg-red-600 mx-auto "></div>
 </div>
 </div>

 {/* 内容区：左图 + 右文案 */}
 <div className="w-full bg-white py-16 px-6 md:py-32 md:px-12 relative z-20">
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
 <div className="w-full lg:w-1/2 relative group overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
 <img
 src={selectedServiceDetail.img}
 alt={t(selectedServiceDetail.title)}
 className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
 />
 </div>
 <div className="w-full lg:w-1/2 flex flex-col items-start lg:pl-8">
 <span className="text-xs font-bold text-red-600 tracking-[0.3em] uppercase mb-4">0{selectedServiceDetail.index + 1} {t("— Our Service")}</span>
 <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-tight tracking-tighter">
 {t(selectedServiceDetail.title)}
 </h2>
 <p className="text-slate-600 leading-relaxed text-base mb-8 md:mb-12 font-medium">
 {t(selectedServiceDetail.desc)}
 </p>
 <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
 <button
 onClick={() => transitionTo('contact')}
 className="w-full sm:w-auto bg-red-600 text-white px-8 py-4 font-bold text-xs tracking-widest hover:bg-red-700 hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all duration-300"
 >
 {t("GET IN TOUCH")}
 </button>
 <button
 onClick={() => transitionTo('home')}
 className="w-full sm:w-auto bg-slate-100 text-slate-900 border border-slate-200 px-8 py-4 font-bold text-xs tracking-widest hover:bg-slate-200 transition-all duration-300"
 >
 {t("BACK TO HOME")}
 </button>
 </div>
 </div>
 </div>
 </div>
 </>
 )}

 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 02: About Us (关于我们) */}
 <div id="about" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#f8fafc', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">
 
 {/* About 顶部 Banner */}
 <div className="relative w-full h-[34vh] min-h-[240px] md:h-[50vh] bg-[#0a0f1c] flex items-center justify-center overflow-hidden shrink-0 mt-[72px] md:mt-24">
 <div className="absolute inset-0 bg-black/50 z-10"></div>
 <img src={imageFor('about.banner', '/img/lanchuang/factory-1.jpg')} alt={t("Handan Lanchuang factory")} className="absolute inset-0 w-full h-full object-cover opacity-60" />
 <div className="relative z-20 text-center px-6 md:px-12">
 <h1 className="text-4xl md:text-7xl font-black font-yahei text-white mb-6 drop-shadow-lg">
 {t("About Us")}
 </h1>
 <div className="w-20 h-1 bg-red-600 mx-auto "></div>
 </div>
 </div>

 {/* 企业介绍模块 */}
 <div className="w-full bg-white py-16 px-6 md:py-32 md:px-12 relative z-20">
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
 {/* 左侧：企业大楼/生产基地展示 */}
 <div className="w-full lg:w-1/2 relative group overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
 <img src={imageFor('about.factory', '/img/lanchuang/factory-2.jpg')} alt={t("Handan Lanchuang production equipment")} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
 </div>
 {/* 右侧：详细介绍与数据统计 */}
 <div className="w-full lg:w-1/2 flex flex-col items-start lg:pl-8">
 <span className="text-xs font-bold text-red-600 tracking-[0.3em] uppercase mb-4"></span>
 <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 leading-tight tracking-tighter">
 {t("Handan Lanchuang Fastener")}<br/>{t("Manufacturing Co., Ltd.")}
 </h2>
 <div className="text-slate-600 leading-relaxed mb-4 md:mb-12 text-sm md:text-base font-medium flex flex-col gap-4">
 <p>
 {t("Handan Lanchuang Fastener Manufacturing Co., Ltd. is a professional manufacturer and supplier of high-quality fasteners, located in Yongnian District, Handan City, Hebei Province, well known as China's largest fastener industrial cluster.")}
 </p>
 <p>
 {t("We specialize in standard and OEM bolts, nuts, threaded rods, anchor bolts, photovoltaic fasteners, construction fasteners, mining accessories, railway fittings and customized metal components. Products are available to GB, DIN, ANSI and ISO standards with a range of surface treatments.")}
 </p>
 <p>
 {t("Guided by “Quality First, Credit Supreme, Long-term Cooperation,” we provide reliable products, competitive prices and efficient service for global clients, supporting both large-volume orders and customized solutions.")}
 </p>
 </div>
 
 </div>
 </div>
 </div>

 {/* CTA / Join Us 区域 - 左右双栏 */}
 <div className="w-full bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-slate-900 py-16 px-6 md:py-24 md:px-12 border-t border-slate-800 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-[40%] h-full bg-red-600/5 blur-[120px] pointer-events-none"></div>
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center relative z-10">
 {/* 左侧：文案 + CTA */}
 <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
 <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/10">
 <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
 </svg>
 </div>
 <h2 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight">{t("Partner With Lan Chuang")}</h2>
 <p className="text-slate-400 mb-10 text-sm md:text-base leading-relaxed max-w-md">
 {t("Build a reliable long-term supply partnership with a fastener manufacturer located at the heart of China's fastener industry.")}
 </p>
 <button onClick={() => transitionTo('contact')} className="bg-red-600 text-white px-10 py-4 font-bold text-xs tracking-widest hover:bg-red-700 hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group">
 {t("GET IN TOUCH")}
 <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform duration-300">&rsaquo;</span>
 </button>
 </div>

 {/* 右侧：产品视频 */}
 <div className="w-full lg:w-1/2 max-w-[555px] mx-auto relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
 <img
 src={imageFor('about.cta', '/img/lanchuang/factory-1.jpg')}
 alt={t("Lan Chuang fastener production workshop")}
 className="w-full aspect-[4/3] object-cover"
 />
 </div>
 </div>
 </div>

 {/* 底部复用 Footer */}
 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 04: Services (服务页) */}
 <div id="services" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#f8fafc', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">
 
 {/* Services 顶部 Banner */}
 <div className="relative w-full h-[34vh] min-h-[240px] md:h-[50vh] bg-[#0a0f1c] flex items-center justify-center overflow-hidden shrink-0 mt-[72px] md:mt-24">
 <div className="absolute inset-0 bg-black/50 z-10"></div>
 <img src={imageFor('services.banner', '/img/lanchuang/factory-2.jpg')} alt={t("Fastener manufacturing services")} className="absolute inset-0 w-full h-full object-cover opacity-60" />
 <div className="relative z-20 text-center px-6 md:px-12">
 <h1 className="text-4xl md:text-7xl font-black font-yahei text-white mb-6 drop-shadow-lg">
 {t("Services")}
 </h1>
 <div className="w-20 h-1 bg-red-600 mx-auto "></div>
 </div>
 </div>

 {/* 核心服务区域 (交替布局) */}
 <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-32 flex flex-col gap-16 md:gap-32">
 {managedServicesData.map((svc, idx) => (
 <div key={idx} className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
 {/* 图片 */}
 <div className="w-full lg:w-1/2 relative group overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
 <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
 <img src={svc.img} alt={t(svc.title)} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
 </div>
 {/* 内容 */}
 <div className="w-full lg:w-1/2 flex flex-col items-start">
 <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 flex items-center justify-center text-red-600 mb-6 md:mb-8 border border-red-100 shadow-sm">
 {svc.icon}
 </div>
 <div className="text-[10px] text-red-500 font-bold tracking-[0.3em] uppercase mb-4">{t("Service")} {String(idx + 1).padStart(2, '0')}</div>
 <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
 {t(svc.title)}
 </h2>
 <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-8 md:mb-10 max-w-lg">
 {t(svc.desc)}
 <br/><br/>
 {t("Share your required standard, dimensions, material, finish, quantity or drawings, and our team will review the most suitable production solution for your order.")}
 </p>
 <button onClick={() => transitionTo('contact')} className="flex items-center gap-4 text-sm font-bold text-slate-900 group">
 <div className="w-12 h-12 bg-slate-100 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
 </div>
 <span className="group-hover:text-red-600 transition-colors uppercase tracking-widest text-xs">{t("Inquire More")}</span>
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* 质保与承诺模块 */}
 <div className="w-full bg-[#0a0f1c] py-16 px-6 md:py-32 md:px-12 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
 <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-red-600/5 blur-[120px] "></div>
 </div>
 
 <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
 <div className="w-full md:w-1/2">
 <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-8 leading-tight">{t("Our Commitment - Reliable Fastener Supply")}</h2>
 <p className="text-slate-400 leading-relaxed mb-10">
 {t("Every order is supported by controlled production, dimensional consistency and quality inspection, with efficient communication from quotation through delivery.")}
 </p>
 <div className="grid grid-cols-2 gap-4 md:gap-8">
 <div>
 <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{t("GB")}<span className="text-red-500"> {t("/ DIN")}</span></div>
 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t("Standard Production")}</div>
 </div>
 <div>
 <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{t("ANSI")}<span className="text-red-500"> {t("/ ISO")}</span></div>
 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t("International Supply")}</div>
 </div>
 </div>
 </div>
 <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-colors">
 <svg className="w-8 h-8 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
 <h4 className="text-white font-bold mb-2">{t("Quality Control")}</h4>
 <p className="text-slate-400 text-sm">{t("Consistent dimensions and stable batch performance.")}</p>
 </div>
 <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-colors sm:mt-8">
 <svg className="w-8 h-8 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
 <h4 className="text-white font-bold mb-2">{t("OEM Capability")}</h4>
 <p className="text-slate-400 text-sm">{t("Customized metal components made to project needs.")}</p>
 </div>
 </div>
 </div>
 </div>

 {/* 底部复用 Footer */}
 {renderFooter()}

 </div>
 </div>
 </div>

 {/* 页面 05: Contact Us (联系我们) */}
 <div id="contact" className="page-wrapper" style={{ display: 'none' }}>
 <div className="page justify-start items-start !p-0 overflow-y-auto overflow-x-hidden" style={{ background: '#f8fafc', display: 'block' }}>
 <div className="scroll-content w-full relative h-max flex-none min-h-screen flex flex-col">
 
 {/* Contact 顶部 Banner */}
 <div className="relative w-full h-[34vh] min-h-[240px] md:h-[50vh] bg-[#0a0f1c] flex items-center justify-center overflow-hidden shrink-0 mt-[72px] md:mt-24">
 <div className="absolute inset-0 bg-black/60 z-10"></div>
 <img src={imageFor('contact.banner', '/img/lanchuang/factory-2.jpg')} alt={t("Contact Handan Lanchuang")} className="absolute inset-0 w-full h-full object-cover opacity-60" />
 <div className="relative z-20 text-center px-6 md:px-12">
 <h1 className="text-4xl md:text-7xl font-black font-yahei text-white mb-6 drop-shadow-lg">
 {t("Contact Us")}
 </h1>
 <div className="w-20 h-1 bg-red-600 mx-auto "></div>
 </div>
 </div>

 {/* 联系表单与信息区 (与首页一致的高级表单交互) */}
 <div className="relative w-full bg-white py-16 px-6 md:py-32 md:px-12 z-20 flex flex-col items-center">
 <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
 
 {/* 左侧：联系信息与标语 */}
 <div className="w-full lg:w-[40%] flex flex-col items-start justify-center">
 <h2 className="text-2xl md:text-3xl font-black font-yahei text-slate-900 mb-5 md:mb-8 tracking-tight leading-tight">
 {t("Let's Start a Conversation")}
 </h2>
 <p className="text-slate-600 leading-relaxed mb-8 md:mb-12 text-sm md:text-base font-medium max-w-md">
 {t("Tell us the product standard, size, finish, quantity or drawing requirements. Our team will help you develop the right standard or OEM fastener solution.")}
 </p>

 <div className="flex flex-col gap-6 md:gap-8 w-full">
 <ContactMethods locale={locale} contacts={whatsappContacts} email={contactEmail} />
 {/* Location */}
 <div className="flex items-start gap-6 group cursor-pointer">
 <div className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-colors duration-300 shrink-0 shadow-sm">
 <svg className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 </div>
 <div>
 <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">{t("Headquarters")}</p>
 <p className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors">{t("West Zone 3-46, Hebeipu Standard Parts Industrial City,")}<br/>{t("Yongnian District, Handan, Hebei, China")}</p>
 </div>
 </div>
 </div>
 </div>

 {/* 右侧：高级询盘表单 */}
 <div className="w-full lg:w-[60%] relative">
 {/* 背景装饰框 */}
 <div className="absolute inset-0 bg-slate-100 transform translate-x-4 translate-y-4 -z-10"></div>
 
 <div className="bg-white p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
 {/* 顶角红色滑动装饰线 */}
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
 
 <h3 className="text-2xl font-bold text-slate-900 mb-8 md:mb-10">{t("Send an Inquiry")}</h3>
 
 <form className="flex flex-col gap-6">
 {/* 姓名与邮箱 */}
 <div className="flex flex-col md:flex-row gap-6">
 <div className="flex-1 relative">
 <input type="text" id="contact-name" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Name")} />
 <label htmlFor="contact-name" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Your Name")}</label>
 </div>
 <div className="flex-1 relative">
 <input type="email" id="contact-email" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Email")} />
 <label htmlFor="contact-email" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Email Address")}</label>
 </div>
 </div>
 
 {/* 电话与公司 */}
 <div className="flex flex-col md:flex-row gap-6">
 <div className="flex-1 relative">
 <input type="text" id="contact-phone" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Phone")} />
 <label htmlFor="contact-phone" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Phone Number")}</label>
 </div>
 <div className="flex-1 relative">
 <input type="text" id="contact-company" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent" placeholder={t("Company")} />
 <label htmlFor="contact-company" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Company Name")}</label>
 </div>
 </div>
 
 {/* 意向产品下拉框 */}
 <div className="relative">
 <select id="contact-interest" defaultValue="" className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer invalid:text-slate-400">
 <option value="" disabled hidden>{t("Product of Interest")}</option>
 {categories.map((cat) => <option key={cat} value={String(cat).toLowerCase().replaceAll(' ', '-')} className="text-slate-900">{t(cat)}</option>)}
 <option value="oem" className="text-slate-900">{t("OEM / Customized Fasteners")}</option>
 </select>
 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
 </div>
 </div>

 {/* 留言内容区 */}
 <div className="relative">
 <textarea id="contact-message" rows={4} className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all peer placeholder-transparent resize-none" placeholder={t("Message")}></textarea>
 <label htmlFor="contact-message" className="absolute left-6 top-4 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">{t("Project Details or Questions")}</label>
 </div>

 {/* 提交按钮 */}
 <button type="button" className="w-full bg-[#0a0f1c] text-white py-5 font-bold text-sm tracking-widest uppercase hover:bg-red-600 hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mt-4 group">
 {t("SUBMIT INQUIRY")}
 <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
 </button>
 </form>
 </div>
 </div>

 </div>
 </div>

 {/* 底部复用 Footer */}
 {renderFooter()}

 </div>
 </div>
 </div>

 </div>
 </div>
 </>
 );
}
