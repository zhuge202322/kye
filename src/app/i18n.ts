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
 'Order Tracking': 'Отслеживание заказа',
 'Track Your Order': 'Отследить заказ',
 'Enter your contract number to view the latest production and delivery status.': 'Введите номер договора, чтобы узнать актуальный статус производства и доставки.',
 'Contract Number': 'Номер договора',
 'CHECK STATUS': 'ПРОВЕРИТЬ СТАТУС',
 'Checking...': 'Проверка...',
 'Order not found': 'Заказ не найден',
 'No order was found for this contract number. Please verify it and try again.': 'Заказ с таким номером договора не найден. Проверьте номер и повторите попытку.',
 'Please enter a valid contract number.': 'Введите действительный номер договора.',
 'Current Status': 'Текущий статус',
 'Order Progress': 'Ход выполнения заказа',
 'Last Updated': 'Последнее обновление',
 'Order Note': 'Примечание к заказу',
 'No additional update is available.': 'Дополнительных обновлений пока нет.',
 Pending: 'Ожидает подтверждения',
 Confirmed: 'Подтвержден',
 'In Production': 'В производстве',
 'Quality Check': 'Контроль качества',
 'Ready to Ship': 'Готов к отправке',
 Shipped: 'Отправлен',
 Completed: 'Завершен',
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
 'Order Tracking': 'تتبع الطلب',
 'Track Your Order': 'تتبع طلبك',
 'Enter your contract number to view the latest production and delivery status.': 'أدخل رقم العقد لعرض أحدث حالة للإنتاج والتسليم.',
 'Contract Number': 'رقم العقد',
 'CHECK STATUS': 'تحقق من الحالة',
 'Checking...': 'جارٍ التحقق...',
 'Order not found': 'لم يتم العثور على الطلب',
 'No order was found for this contract number. Please verify it and try again.': 'لم يتم العثور على طلب برقم العقد هذا. يرجى التحقق من الرقم والمحاولة مرة أخرى.',
 'Please enter a valid contract number.': 'يرجى إدخال رقم عقد صالح.',
 'Current Status': 'الحالة الحالية',
 'Order Progress': 'تقدم الطلب',
 'Last Updated': 'آخر تحديث',
 'Order Note': 'ملاحظة الطلب',
 'No additional update is available.': 'لا توجد تحديثات إضافية متاحة.',
 Pending: 'في انتظار التأكيد',
 Confirmed: 'تم التأكيد',
 'In Production': 'قيد الإنتاج',
 'Quality Check': 'فحص الجودة',
 'Ready to Ship': 'جاهز للشحن',
 Shipped: 'تم الشحن',
 Completed: 'مكتمل',
 },
 es: {
 Home: 'Inicio',
 'Order Tracking': 'Seguimiento del pedido',
 'Track Your Order': 'Consulta tu pedido',
 'Enter your contract number to view the latest production and delivery status.': 'Introduce el número de contrato para consultar el estado más reciente de producción y entrega.',
 'Contract Number': 'Número de contrato',
 'CHECK STATUS': 'CONSULTAR ESTADO',
 'Checking...': 'Consultando...',
 'Order not found': 'Pedido no encontrado',
 'No order was found for this contract number. Please verify it and try again.': 'No se encontró ningún pedido con este número de contrato. Verifícalo e inténtalo de nuevo.',
 'Please enter a valid contract number.': 'Introduce un número de contrato válido.',
 'Current Status': 'Estado actual',
 'Order Progress': 'Progreso del pedido',
 'Last Updated': 'Última actualización',
 'Order Note': 'Nota del pedido',
 'No additional update is available.': 'No hay actualizaciones adicionales.',
 Pending: 'Pendiente de confirmación',
 Confirmed: 'Confirmado',
 'In Production': 'En producción',
 'Quality Check': 'Control de calidad',
 'Ready to Ship': 'Listo para enviar',
 Shipped: 'Enviado',
 Completed: 'Completado',
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
