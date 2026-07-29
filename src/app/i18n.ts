import generatedTranslations from './translations.generated.json';

export const localeOptions = [
 { code: 'en', shortLabel: 'EN', label: 'English' },
 { code: 'ru', shortLabel: 'RU', label: 'Русский' },
 { code: 'ar', shortLabel: 'AR', label: 'العربية' },
 { code: 'es', shortLabel: 'ES', label: 'Español' },
] as const;

export type Locale = (typeof localeOptions)[number]['code'];

type TargetLocale = Exclude<Locale, 'en'>;
type TranslationData = {
 dictionaries: Record<TargetLocale, Record<string, string>>;
 productHtml: Record<TargetLocale, Record<string, string>>;
};

const translationData = generatedTranslations as TranslationData;

const terminologyOverrides: Partial<Record<TargetLocale, Record<string, string>>> = {
 ru: {
 Home: 'Главная',
 Products: 'Продукция',
 'Allen Bolt': 'Болт с внутренним шестигранником',
 'Allen Bolt - Variant 1': 'Болт с внутренним шестигранником — вариант 1',
 'Allen Bolt - Variant 2': 'Болт с внутренним шестигранником — вариант 2',
 },
 ar: {
 Home: 'الرئيسية',
 Products: 'المنتجات',
 Bolt: 'مسامير الربط',
 Nut: 'الصواميل',
 'Threaded Rods': 'القضبان الملولبة',
 Anchor: 'مراسي التثبيت',
 Washer: 'الوردات',
 Screw: 'البراغي',
 'Drop-In Anchor': 'مرساة تثبيت داخلية',
 'Expansion Bolt': 'مسمار تمدد',
 'Sleeve Anchor': 'مرساة غلافية',
 'Wedge Anchor - Variant 1': 'مرساة إسفينية - الطراز 1',
 'Wedge Anchor - Variant 2': 'مرساة إسفينية - الطراز 2',
 'Wedge Anchor': 'مرساة إسفينية',
 'Allen Bolt': 'مسمار ألن',
 'Allen Bolt - Variant 1': 'مسمار ألن - الطراز 1',
 'Allen Bolt - Variant 2': 'مسمار ألن - الطراز 2',
 'Carriage Bolt': 'مسمار عربة',
 'Carriage Bolt - Variant 1': 'مسمار عربة - الطراز 1',
 'Carriage Bolt - Variant 2': 'مسمار عربة - الطراز 2',
 'Flange Bolt': 'مسمار فلنجي',
 'Flange Bolt - Variant 1': 'مسمار فلنجي - الطراز 1',
 'Flange Bolt - Variant 2': 'مسمار فلنجي - الطراز 2',
 'Flange Bolt - Variant 3': 'مسمار فلنجي - الطراز 3',
 'Hex Bolt': 'مسمار سداسي',
 'Hex Bolt - Variant 1': 'مسمار سداسي - الطراز 1',
 'Hex Bolt - Variant 2': 'مسمار سداسي - الطراز 2',
 'Zinc-Plated Bolt': 'مسمار مطلي بالزنك',
 'Cap Nut': 'صامولة غطاء',
 'Flange Nut': 'صامولة فلنجية',
 'Hex Nut': 'صامولة سداسية',
 'Nylon Lock Nut - Variant 1': 'صامولة قفل نايلون - الطراز 1',
 'Nylon Lock Nut - Variant 2': 'صامولة قفل نايلون - الطراز 2',
 'Nylon Lock Nut': 'صامولة قفل نايلون',
 'Self-Drilling Screw': 'برغي ذاتي الحفر',
 'High-Tensile Threaded Rod - Variant 1': 'قضيب ملولب عالي الشد - الطراز 1',
 'High-Tensile Threaded Rod - Variant 2': 'قضيب ملولب عالي الشد - الطراز 2',
 'High-Tensile Threaded Rod': 'قضيب ملولب عالي الشد',
 'High-Tensile Threaded Stud': 'مسمار ملولب عالي الشد',
 'Threaded Rod - Variant 1': 'قضيب ملولب - الطراز 1',
 'Threaded Rod - Variant 2': 'قضيب ملولب - الطراز 2',
 'Threaded Rod - Variant 3': 'قضيب ملولب - الطراز 3',
 'Threaded Rod - Variant 4': 'قضيب ملولب - الطراز 4',
 'Threaded Rod': 'قضيب ملولب',
 'Flat Washer': 'وردة مسطحة',
 'Zinc-Plated Flat Washer': 'وردة مسطحة مطلية بالزنك',
 },
 es: {
 Home: 'Inicio',
 },
};

export function isLocale(value: string | null): value is Locale {
 return localeOptions.some((option) => option.code === value);
}

export function isRtlLocale(locale: Locale) {
 return locale === 'ar';
}

export function translate(locale: Locale, source: string) {
 if (locale === 'en') return source;
 return terminologyOverrides[locale]?.[source] ?? translationData.dictionaries[locale][source] ?? source;
}

export function translateProductHtml(locale: Locale, html: string) {
 if (locale === 'en') return html;
 let translated = translationData.productHtml[locale][html] ?? html;
 const sourceHeading = html.match(/<h3>([^<]+)<\/h3>/)?.[1];
 if (sourceHeading) {
 translated = translated.replace(/<h3>[^<]*<\/h3>/, `<h3>${translate(locale, sourceHeading)}</h3>`);
 }

 if (locale !== 'ar') return translated;
 return translated
 .replaceAll('الجوز', 'الصواميل')
 .replaceAll('غسالة', 'وردة')
 .replaceAll('عرافة بولت', 'مسمار سداسي');
}
