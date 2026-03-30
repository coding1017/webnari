/**
 * Latinas Be Like Design — Shared Data Layer
 * Imported by all LBLD pages via <script src="lbld-data.js">
 * Provides: product catalog, cart, wishlist, custom orders,
 *           inventory management, i18n, analytics, export/import
 * Only global: window.LBLDData
 */
(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  var SK_PRODUCTS     = 'lbld_products';
  var SK_CART         = 'lbld_cart';
  var SK_WISHLIST     = 'lbld_wishlist';
  var SK_ORDERS       = 'lbld_orders';
  var SK_CUSTOM       = 'lbld_custom_orders';
  var SK_INVENTORY    = 'lbld_inventory';
  var SK_ANALYTICS    = 'lbld_analytics';
  var SK_LANG         = 'lbld_lang';
  var SK_SETTINGS     = 'lbld_settings';

  var CATEGORIES = ['shirts', 'sweaters', 'hoodies', 'cups', 'mugs', 'glass-cans', 'hats', 'tumblers', '3d-prints'];
  var BADGES = [null, 'new', 'sold', 'custom', 'popular', 'technique'];
  var TECHNIQUES = ['standard', 'snowglobe', 'goopy', 'lava', 'zipper', 'dtf', 'sublimation', '3d-print'];
  var ORDER_STATUSES = ['pending', 'quote-requested', 'in-progress', 'completed', 'shipped', 'cancelled'];
  var SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  // ---------------------------------------------------------------------------
  // i18n Translations
  // ---------------------------------------------------------------------------

  var TRANSLATIONS = {
    en: {
      // Nav
      'nav.shop': 'Shop',
      'nav.custom': 'Custom Order',
      'nav.techniques': 'Techniques',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.cart': 'Cart',
      'nav.search': 'Search',
      'nav.lang': 'ES',

      // Hero
      'hero.badge': 'Latina-Owned & Handcrafted',
      'hero.title1': 'Handmade.',
      'hero.title2': 'Made With Love.',
      'hero.subtitle': 'Custom apparel, specialty drinkware, and 3D designs \u2014 crafted just for you by a Latina mother-daughter team.',
      'hero.cta.custom': 'Start Your Custom Order',
      'hero.cta.browse': 'Browse Collection',
      'hero.stat.customers': 'Happy Customers',
      'hero.stat.designs': 'Custom Designs',
      'hero.stat.rating': 'Star Rating',

      // Marquee
      'marquee.shirts': 'Custom Shirts',
      'marquee.cups': 'Snowglobe Cups',
      'marquee.3d': '3D Designs',
      'marquee.glass': 'Glass Cans',
      'marquee.tumblers': 'Tumblers',
      'marquee.mugs': 'Custom Mugs',
      'marquee.hats': 'Hats',
      'marquee.hoodies': 'Hoodies',

      // What We Do
      'services.title': 'What We Create',
      'services.subtitle': 'Every piece tells a story. Every design is uniquely yours.',
      'services.apparel.title': 'Custom Apparel',
      'services.apparel.desc': 'T-shirts, sweaters, and hoodies with your design \u2014 DTF printed for vibrant, long-lasting color.',
      'services.drinkware.title': 'Specialty Drinkware',
      'services.drinkware.desc': 'Snowglobe cups, glass cans, tumblers, and mugs with stunning handcrafted techniques.',
      'services.more.title': '3D & More',
      'services.more.desc': '3D-printed designs, custom hats, and unique accessories that stand out.',
      'services.explore': 'Explore',

      // How It Works
      'process.title': 'How Custom Orders Work',
      'process.subtitle': 'From your idea to a one-of-a-kind creation in 4 simple steps.',
      'process.step1.title': 'Choose Your Item',
      'process.step1.desc': 'Pick from shirts, cups, tumblers, hats, and more.',
      'process.step2.title': 'Send Your Design',
      'process.step2.desc': 'Upload an image or describe what you envision.',
      'process.step3.title': 'We Create It',
      'process.step3.desc': 'Handcrafted with care in 3\u20137 business days.',
      'process.step4.title': 'Delivered to You',
      'process.step4.desc': 'Packaged with love and shipped to your door.',

      // About page
      'about.label': 'Our Story',
      'about.title': 'About Us',
      'about.subtitle': 'A Latina mother-daughter team crafting custom designs with love, pride, and passion.',
      'about.quote': 'We started this business so we could build something together without missing the moments that matter.',
      'about.story1': 'Latinas Be Like Design started with a simple idea: a mother and daughter spending time together, creating something beautiful. What began as a creative hobby at the kitchen table quickly grew into something much bigger.',
      'about.story2': 'Margarita Duque and her daughter launched the business to combine their love of design with their Latina heritage. Every piece they create carries that same energy: bold, colorful, personal, and made with genuine care.',
      'about.story3': 'From custom shirts and specialty drinkware to 3D-printed designs, each item is handcrafted in-house. No mass production, no shortcuts. Just two women pouring their hearts into every order, celebrating their culture one design at a time.',
      'about.story4': 'For them, this business is more than products. It is about family, Latina pride, and the belief that handmade things carry a special kind of love that you can feel the moment you hold them.',
      'about.sig': 'Founders, Latinas Be Like Design',
      'about.values.label': 'What We Stand For',
      'about.values.title': 'Our Values',
      'about.values.family.title': 'Family First',
      'about.values.family.desc': 'Everything we do starts and ends with family. This business was born from a mother-daughter bond, and that love is woven into every single piece we create.',
      'about.values.pride.title': 'Cultural Pride',
      'about.values.pride.desc': 'We celebrate our Latina heritage through vibrant designs, bold colors, and the warmth of our culture. Every creation is an expression of where we come from.',
      'about.values.quality.title': 'Handmade Quality',
      'about.values.quality.desc': 'No mass production, no shortcuts. Every item is crafted by hand in our workshop with premium materials and meticulous attention to detail.',
      'about.bts.title': 'Where the Magic Happens',
      'about.bts.cap1': 'Preparing custom designs',
      'about.bts.cap2': 'Handcrafting each piece',
      'about.bts.cap3': 'Packaging with love',
      'about.cta.title': 'Ready to create something unique?',
      'about.cta.desc': 'Let us bring your vision to life with a custom design made just for you.',
      'about.cta.btn': 'Start Your Custom Order',

      // Featured
      'featured.title': 'Featured Products',
      'featured.subtitle': 'Our latest and most-loved creations.',
      'featured.viewall': 'View All Products',

      // Techniques
      'techniques.title': 'Our Signature Techniques',
      'techniques.subtitle': 'What makes our drinkware truly special.',
      'techniques.learn': 'Learn More',

      // About
      'about.title': 'Meet the Creators',
      'about.subtitle': 'A mother-daughter team building something beautiful, together.',
      'about.cta': 'Our Story',

      // Reviews
      'reviews.title': 'What Our Customers Say',
      'reviews.subtitle': 'Real love from real people.',

      // Instagram
      'ig.title': 'Follow Our Journey',
      'ig.cta': 'Follow @latinasbelikedesign',

      // CTA
      'cta.title': 'Ready to Create Something Unique?',
      'cta.subtitle': 'Whether it\'s a gift, a memory, or just something you love \u2014 we\'ll make it happen.',
      'cta.button': 'Start Your Custom Order',

      // Footer
      'footer.tagline': 'Handcrafted with love by a Latina mother-daughter team.',
      'footer.shop': 'Shop',
      'footer.company': 'Company',
      'footer.contact': 'Contact',
      'footer.rights': 'All rights reserved.',
      'footer.webnari': 'Built and managed by',

      // Techniques
      'techniques.label': 'Signature Techniques',

      // Techniques page
      'tech.title': 'Our Signature Techniques',
      'tech.subtitle': 'The artistry behind every piece we create.',
      'tech.intro': 'Each technique is a craft we\'ve perfected — from floating snowglobe particles to hand-painted goopy drips. Here\'s how we make the magic happen.',

      // Shop
      'shop.title': 'Shop All',
      'shop.filter.all': 'All',
      'shop.filter.shirts': 'Shirts',
      'shop.filter.sweaters': 'Sweaters',
      'shop.filter.hoodies': 'Hoodies',
      'shop.filter.cups': 'Cups',
      'shop.filter.mugs': 'Mugs',
      'shop.filter.glass': 'Glass Cans',
      'shop.filter.hats': 'Hats',
      'shop.filter.tumblers': 'Tumblers',
      'shop.filter.3d': '3D Prints',
      'shop.sort.newest': 'Newest',
      'shop.sort.low': 'Price: Low to High',
      'shop.sort.high': 'Price: High to Low',
      'shop.empty': 'Nothing here yet \u2014 check back soon!',
      'shop.custom.cta': 'Want something custom?',
      'shop.addtocart': 'Add to Cart',
      'shop.customize': 'Customize',
      'shop.soldout': 'Sold Out',
      'shop.madetoorder': 'Made to Order',

      // Product
      'product.description': 'Description',
      'product.sizeguide': 'Size Guide',
      'product.care': 'Care Instructions',
      'product.reviews': 'Reviews',
      'product.related': 'You May Also Like',
      'product.customize': 'Want this customized?',
      'product.customize.desc': 'Tell us how you\'d like to make this uniquely yours.',
      'product.instock': 'In Stock',
      'product.lowstock': 'Only {n} left!',
      'product.outofstock': 'Sold Out',
      'product.madetoorder': 'Made to Order',

      // Custom Order
      'custom.title': 'Create Your Custom Order',
      'custom.subtitle': 'Design something that\'s uniquely yours.',
      'custom.step1': 'Choose Your Canvas',
      'custom.step2': 'Select Options',
      'custom.step3': 'Upload Your Design',
      'custom.step4': 'Review & Submit',
      'custom.next': 'Next Step',
      'custom.back': 'Back',
      'custom.submit': 'Submit Order',
      'custom.nodesign': 'No design? We can create one!',
      'custom.upload.title': 'Drop your design here',
      'custom.upload.subtitle': 'PNG, JPG, SVG, or PDF',
      'custom.processing': 'Processing time: 3\u20137 business days',

      // Cart
      'cart.title': 'Your Cart',
      'cart.empty': 'Your cart is empty',
      'cart.subtotal': 'Subtotal',
      'cart.checkout': 'Checkout',
      'cart.continue': 'Continue Shopping',
      'cart.added': 'Added to cart!',
      'cart.removed': 'Removed from cart',

      // Contact
      'contact.title': 'Get in Touch',
      'contact.subtitle': 'Have a question or ready to start your custom order?',
      'contact.name': 'Your Name',
      'contact.email': 'Email Address',
      'contact.phone': 'Phone (optional)',
      'contact.subject': 'Subject',
      'contact.subject.custom': 'Custom Order',
      'contact.subject.question': 'General Question',
      'contact.subject.wholesale': 'Wholesale Inquiry',
      'contact.subject.other': 'Other',
      'contact.message': 'Message',
      'contact.send': 'Send Message',
      'contact.success': 'Message sent! We\'ll get back to you soon.',

      // Contact page extended
      'contact.hours.title': 'Business Hours',
      'contact.hours.monFri': 'Monday - Friday',
      'contact.hours.sat': 'Saturday',
      'contact.hours.sun': 'Sunday',
      'contact.hours.closed': 'Closed',
      'contact.cta.title': 'Looking for a Custom Order?',
      'contact.cta.desc': 'Skip the form and go straight to our custom order builder to design your perfect piece.',
      'contact.cta.btn': 'Start Custom Order',
      'contact.form.title': 'Send Us a Message',
      'contact.form.name': 'Name *',
      'contact.form.nameError': 'Please enter your name.',
      'contact.form.email': 'Email *',
      'contact.form.emailError': 'Please enter a valid email.',
      'contact.form.phone': 'Phone (optional)',
      'contact.form.subject': 'Subject *',
      'contact.form.subjectDefault': 'Select a topic...',
      'contact.form.subjectCustom': 'Custom Order',
      'contact.form.subjectGeneral': 'General Question',
      'contact.form.subjectWholesale': 'Wholesale Inquiry',
      'contact.form.subjectOther': 'Other',
      'contact.form.subjectError': 'Please select a subject.',
      'contact.form.message': 'Message *',
      'contact.form.messageError': 'Please enter your message.',
      'contact.form.submit': 'Send Message',
      'contact.form.successTitle': 'Message Sent!',
      'contact.form.successDesc': 'Thank you for reaching out. We will get back to you within 24-48 hours.',
      'contact.faq.title': 'Frequently Asked Questions',
      'contact.faq.subtitle': 'Quick answers to our most common questions.',
      'contact.faq.q1': 'How long does a custom order take?',
      'contact.faq.a1': 'Most custom orders are completed within 5-10 business days depending on complexity and current order volume. Rush orders may be available for an additional fee.',
      'contact.faq.q2': 'What file formats do you accept for designs?',
      'contact.faq.a2': 'We accept PNG, JPG, SVG, PDF, and AI files. For the best results, we recommend high-resolution files with transparent backgrounds. If you only have a rough idea, we can work with that too.',
      'contact.faq.q3': 'Can I see a proof before you make it?',
      'contact.faq.a3': 'Absolutely! We always send a digital proof for your approval before we start crafting. You can request changes before production begins.',
      'contact.faq.q4': 'What is the Snowglobe technique?',
      'contact.faq.a4': 'Our Snowglobe technique seals decorative floating particles inside a double-walled glass. When you shake the cup, the particles swirl around like a snow globe.',
      'contact.faq.q5': 'Do you ship internationally?',
      'contact.faq.a5': 'Currently we ship within the United States. International shipping may be available on a case-by-case basis \u2014 contact us to discuss.',
      'contact.faq.q6': 'What is your return policy?',
      'contact.faq.a6': 'Because each item is custom-made, we generally do not accept returns. However, if there is a defect or the item does not match the approved proof, we will make it right.',

      // About Page
      'about.page.title': 'Our Story',
      'about.page.subtitle': 'Built on love, culture, and creativity.',
      'about.values.family': 'Family First',
      'about.values.family.desc': 'We started this business so we could build something together without missing the moments that matter.',
      'about.values.culture': 'Cultural Pride',
      'about.values.culture.desc': 'Every design carries our Latina identity \u2014 bold, vibrant, and full of meaning.',
      'about.values.quality': 'Handmade Quality',
      'about.values.quality.desc': 'Premium materials, meticulous technique, and personal attention to every single piece.',

      // Badges
      'badge.new': 'New',
      'badge.sold': 'Sold Out',
      'badge.custom': 'Custom',
      'badge.popular': 'Popular',
      'badge.technique': 'Specialty',

      // General
      'general.loading': 'Loading...',
      'general.error': 'Something went wrong. Please try again.',
      'general.close': 'Close',
      'general.viewall': 'View All',
    },

    es: {
      // Nav
      'nav.shop': 'Tienda',
      'nav.custom': 'Pedido Personalizado',
      'nav.techniques': 'T\u00e9cnicas',
      'nav.about': 'Nosotras',
      'nav.contact': 'Contacto',
      'nav.cart': 'Carrito',
      'nav.search': 'Buscar',
      'nav.lang': 'EN',

      // Hero
      'hero.badge': 'Latina y Artesanal',
      'hero.title1': 'Hecho a Mano.',
      'hero.title2': 'Hecho Con Amor.',
      'hero.subtitle': 'Ropa personalizada, vasos especiales y dise\u00f1os 3D \u2014 creados solo para ti por un equipo madre e hija Latina.',
      'hero.cta.custom': 'Comienza Tu Pedido',
      'hero.cta.browse': 'Ver Colecci\u00f3n',
      'hero.stat.customers': 'Clientes Felices',
      'hero.stat.designs': 'Dise\u00f1os Personalizados',
      'hero.stat.rating': 'Calificaci\u00f3n',

      // Techniques
      'techniques.label': 'T\u00e9cnicas Especiales',

      // Marquee
      'marquee.shirts': 'Camisas Personalizadas',
      'marquee.cups': 'Vasos Snowglobe',
      'marquee.3d': 'Dise\u00f1os 3D',
      'marquee.glass': 'Vasos de Vidrio',
      'marquee.tumblers': 'Termos',
      'marquee.mugs': 'Tazas Personalizadas',
      'marquee.hats': 'Gorras',
      'marquee.hoodies': 'Buzos',

      // What We Do
      'services.title': 'Lo Que Creamos',
      'services.subtitle': 'Cada pieza cuenta una historia. Cada dise\u00f1o es \u00fanicamente tuyo.',
      'services.apparel.title': 'Ropa Personalizada',
      'services.apparel.desc': 'Camisas, buzos y hoodies con tu dise\u00f1o \u2014 impresos con DTF para colores vibrantes y duraderos.',
      'services.drinkware.title': 'Vasos Especiales',
      'services.drinkware.desc': 'Vasos snowglobe, vasos de vidrio, termos y tazas con t\u00e9cnicas artesanales impresionantes.',
      'services.more.title': '3D y M\u00e1s',
      'services.more.desc': 'Dise\u00f1os impresos en 3D, gorras personalizadas y accesorios \u00fanicos.',
      'services.explore': 'Explorar',

      // How It Works
      'process.title': 'C\u00f3mo Funcionan los Pedidos',
      'process.subtitle': 'De tu idea a una creaci\u00f3n \u00fanica en 4 simples pasos.',
      'process.step1.title': 'Elige Tu Producto',
      'process.step1.desc': 'Escoge entre camisas, vasos, termos, gorras y m\u00e1s.',
      'process.step2.title': 'Env\u00eda Tu Dise\u00f1o',
      'process.step2.desc': 'Sube una imagen o describe lo que imaginas.',
      'process.step3.title': 'Lo Creamos',
      'process.step3.desc': 'Hecho a mano con cuidado en 3\u20137 d\u00edas h\u00e1biles.',
      'process.step4.title': 'Entregado a Ti',
      'process.step4.desc': 'Empacado con amor y enviado a tu puerta.',

      // Featured
      // About page
      'about.label': 'Nuestra Historia',
      'about.title': 'Sobre Nosotras',
      'about.subtitle': 'Un equipo madre e hija Latina creando dise\u00f1os personalizados con amor, orgullo y pasi\u00f3n.',
      'about.quote': 'Empezamos este negocio para poder construir algo juntas sin perdernos los momentos que importan.',
      'about.story1': 'Latinas Be Like Design comenz\u00f3 con una idea simple: una madre y una hija pasando tiempo juntas, creando algo hermoso. Lo que empez\u00f3 como un pasatiempo creativo en la mesa de la cocina r\u00e1pidamente creci\u00f3 en algo mucho m\u00e1s grande.',
      'about.story2': 'Margarita Duque y su hija lanzaron el negocio para combinar su amor por el dise\u00f1o con su herencia Latina. Cada pieza que crean lleva esa misma energ\u00eda: audaz, colorida, personal y hecha con genuino cuidado.',
      'about.story3': 'Desde camisas personalizadas y vasos especiales hasta dise\u00f1os impresos en 3D, cada art\u00edculo es hecho a mano en casa. Sin producci\u00f3n masiva, sin atajos. Solo dos mujeres poniendo su coraz\u00f3n en cada pedido, celebrando su cultura un dise\u00f1o a la vez.',
      'about.story4': 'Para ellas, este negocio es m\u00e1s que productos. Se trata de familia, orgullo Latino, y la creencia de que las cosas hechas a mano llevan un tipo especial de amor que puedes sentir en el momento en que las sostienes.',
      'about.sig': 'Fundadoras, Latinas Be Like Design',
      'about.values.label': 'Lo Que Representamos',
      'about.values.title': 'Nuestros Valores',
      'about.values.family.title': 'Familia Primero',
      'about.values.family.desc': 'Todo lo que hacemos empieza y termina con la familia. Este negocio naci\u00f3 de un v\u00ednculo madre-hija, y ese amor est\u00e1 tejido en cada pieza que creamos.',
      'about.values.pride.title': 'Orgullo Cultural',
      'about.values.pride.desc': 'Celebramos nuestra herencia Latina a trav\u00e9s de dise\u00f1os vibrantes, colores audaces y la calidez de nuestra cultura. Cada creaci\u00f3n es una expresi\u00f3n de d\u00f3nde venimos.',
      'about.values.quality.title': 'Calidad Artesanal',
      'about.values.quality.desc': 'Sin producci\u00f3n masiva, sin atajos. Cada art\u00edculo es hecho a mano en nuestro taller con materiales premium y atenci\u00f3n meticulosa al detalle.',
      'about.bts.title': 'Donde Sucede la Magia',
      'about.bts.cap1': 'Preparando dise\u00f1os personalizados',
      'about.bts.cap2': 'Creando cada pieza a mano',
      'about.bts.cap3': 'Empacando con amor',
      'about.cta.title': '\u00bfLista para crear algo \u00fanico?',
      'about.cta.desc': 'D\u00e9janos dar vida a tu visi\u00f3n con un dise\u00f1o personalizado hecho solo para ti.',
      'about.cta.btn': 'Comienza Tu Pedido',

      'featured.title': 'Productos Destacados',
      'featured.subtitle': 'Nuestras creaciones m\u00e1s recientes y favoritas.',
      'featured.viewall': 'Ver Todos los Productos',

      // Techniques
      'techniques.title': 'Nuestras T\u00e9cnicas Especiales',
      'techniques.subtitle': 'Lo que hace nuestros vasos verdaderamente especiales.',
      'techniques.learn': 'Saber M\u00e1s',

      // About
      'about.title': 'Conoce a las Creadoras',
      'about.subtitle': 'Un equipo madre e hija construyendo algo hermoso, juntas.',
      'about.cta': 'Nuestra Historia',

      // Reviews
      'reviews.title': 'Lo Que Dicen Nuestros Clientes',
      'reviews.subtitle': 'Amor real de personas reales.',

      // Instagram
      'ig.title': 'Sigue Nuestro Camino',
      'ig.cta': 'Seguir @latinasbelikedesign',

      // CTA
      'cta.title': '\u00bfLista Para Crear Algo \u00danico?',
      'cta.subtitle': 'Ya sea un regalo, un recuerdo, o algo que te encanta \u2014 lo haremos realidad.',
      'cta.button': 'Comienza Tu Pedido',

      // Footer
      'footer.tagline': 'Hecho a mano con amor por un equipo madre e hija Latina.',
      'footer.shop': 'Tienda',
      'footer.company': 'Empresa',
      'footer.contact': 'Contacto',
      'footer.rights': 'Todos los derechos reservados.',
      'footer.webnari': 'Construido y gestionado por',

      // Techniques page
      'tech.title': 'Nuestras T\u00e9cnicas Especiales',
      'tech.subtitle': 'El arte detr\u00e1s de cada pieza que creamos.',
      'tech.intro': 'Cada t\u00e9cnica es un arte que hemos perfeccionado \u2014 desde part\u00edculas flotantes de snowglobe hasta gotas pintadas a mano. As\u00ed es como hacemos la magia.',

      // Shop
      'shop.title': 'Toda la Tienda',
      'shop.filter.all': 'Todo',
      'shop.filter.shirts': 'Camisas',
      'shop.filter.sweaters': 'Buzos',
      'shop.filter.hoodies': 'Hoodies',
      'shop.filter.cups': 'Vasos',
      'shop.filter.mugs': 'Tazas',
      'shop.filter.glass': 'Vasos de Vidrio',
      'shop.filter.hats': 'Gorras',
      'shop.filter.tumblers': 'Termos',
      'shop.filter.3d': 'Impresi\u00f3n 3D',
      'shop.sort.newest': 'M\u00e1s Recientes',
      'shop.sort.low': 'Precio: Menor a Mayor',
      'shop.sort.high': 'Precio: Mayor a Menor',
      'shop.empty': 'Nada aqu\u00ed todav\u00eda \u2014 \u00a1vuelve pronto!',
      'shop.custom.cta': '\u00bfQuieres algo personalizado?',
      'shop.addtocart': 'Agregar al Carrito',
      'shop.customize': 'Personalizar',
      'shop.soldout': 'Agotado',
      'shop.madetoorder': 'Hecho a Pedido',

      // Product
      'product.description': 'Descripci\u00f3n',
      'product.sizeguide': 'Gu\u00eda de Tallas',
      'product.care': 'Instrucciones de Cuidado',
      'product.reviews': 'Rese\u00f1as',
      'product.related': 'Tambi\u00e9n Te Puede Gustar',
      'product.customize': '\u00bfQuieres esto personalizado?',
      'product.customize.desc': 'Cu\u00e9ntanos c\u00f3mo quieres hacerlo \u00fanicamente tuyo.',
      'product.instock': 'En Stock',
      'product.lowstock': '\u00a1Solo quedan {n}!',
      'product.outofstock': 'Agotado',
      'product.madetoorder': 'Hecho a Pedido',

      // Custom Order
      'custom.title': 'Crea Tu Pedido Personalizado',
      'custom.subtitle': 'Dise\u00f1a algo que sea \u00fanicamente tuyo.',
      'custom.step1': 'Elige Tu Producto',
      'custom.step2': 'Selecciona Opciones',
      'custom.step3': 'Sube Tu Dise\u00f1o',
      'custom.step4': 'Revisa y Env\u00eda',
      'custom.next': 'Siguiente Paso',
      'custom.back': 'Atr\u00e1s',
      'custom.submit': 'Enviar Pedido',
      'custom.nodesign': '\u00bfNo tienes dise\u00f1o? \u00a1Nosotras lo creamos!',
      'custom.upload.title': 'Suelta tu dise\u00f1o aqu\u00ed',
      'custom.upload.subtitle': 'PNG, JPG, SVG o PDF',
      'custom.processing': 'Tiempo de procesamiento: 3\u20137 d\u00edas h\u00e1biles',

      // Cart
      'cart.title': 'Tu Carrito',
      'cart.empty': 'Tu carrito est\u00e1 vac\u00edo',
      'cart.subtotal': 'Subtotal',
      'cart.checkout': 'Pagar',
      'cart.continue': 'Seguir Comprando',
      'cart.added': '\u00a1Agregado al carrito!',
      'cart.removed': 'Eliminado del carrito',

      // Contact
      'contact.title': 'Cont\u00e1ctanos',
      'contact.subtitle': '\u00bfTienes una pregunta o est\u00e1s lista para tu pedido personalizado?',
      'contact.name': 'Tu Nombre',
      'contact.email': 'Correo Electr\u00f3nico',
      'contact.phone': 'Tel\u00e9fono (opcional)',
      'contact.subject': 'Asunto',
      'contact.subject.custom': 'Pedido Personalizado',
      'contact.subject.question': 'Pregunta General',
      'contact.subject.wholesale': 'Consulta Mayorista',
      'contact.subject.other': 'Otro',
      'contact.message': 'Mensaje',
      'contact.send': 'Enviar Mensaje',
      'contact.success': '\u00a1Mensaje enviado! Te responderemos pronto.',

      // Contact page extended
      'contact.hours.title': 'Horario de Atenci\u00f3n',
      'contact.hours.monFri': 'Lunes - Viernes',
      'contact.hours.sat': 'S\u00e1bado',
      'contact.hours.sun': 'Domingo',
      'contact.hours.closed': 'Cerrado',
      'contact.cta.title': '\u00bfBuscas un Pedido Personalizado?',
      'contact.cta.desc': 'Salta el formulario y ve directo a nuestro creador de pedidos para dise\u00f1ar tu pieza perfecta.',
      'contact.cta.btn': 'Comenzar Pedido',
      'contact.form.title': 'Env\u00edanos un Mensaje',
      'contact.form.name': 'Nombre *',
      'contact.form.nameError': 'Por favor ingresa tu nombre.',
      'contact.form.email': 'Correo *',
      'contact.form.emailError': 'Por favor ingresa un correo v\u00e1lido.',
      'contact.form.phone': 'Tel\u00e9fono (opcional)',
      'contact.form.subject': 'Asunto *',
      'contact.form.subjectDefault': 'Selecciona un tema...',
      'contact.form.subjectCustom': 'Pedido Personalizado',
      'contact.form.subjectGeneral': 'Pregunta General',
      'contact.form.subjectWholesale': 'Consulta Mayorista',
      'contact.form.subjectOther': 'Otro',
      'contact.form.subjectError': 'Por favor selecciona un asunto.',
      'contact.form.message': 'Mensaje *',
      'contact.form.messageError': 'Por favor ingresa tu mensaje.',
      'contact.form.submit': 'Enviar Mensaje',
      'contact.form.successTitle': '\u00a1Mensaje Enviado!',
      'contact.form.successDesc': 'Gracias por escribirnos. Te responderemos en 24-48 horas.',
      'contact.faq.title': 'Preguntas Frecuentes',
      'contact.faq.subtitle': 'Respuestas r\u00e1pidas a nuestras preguntas m\u00e1s comunes.',
      'contact.faq.q1': '\u00bfCu\u00e1nto tarda un pedido personalizado?',
      'contact.faq.a1': 'La mayor\u00eda de los pedidos se completan en 5-10 d\u00edas h\u00e1biles dependiendo de la complejidad. Pedidos urgentes pueden estar disponibles por un cargo adicional.',
      'contact.faq.q2': '\u00bfQu\u00e9 formatos de archivo aceptan?',
      'contact.faq.a2': 'Aceptamos PNG, JPG, SVG, PDF y AI. Recomendamos archivos de alta resoluci\u00f3n con fondo transparente. Si solo tienes una idea, tambi\u00e9n podemos trabajar con eso.',
      'contact.faq.q3': '\u00bfPuedo ver una prueba antes de que lo hagan?',
      'contact.faq.a3': '\u00a1Por supuesto! Siempre enviamos una prueba digital para tu aprobaci\u00f3n antes de comenzar. Puedes pedir cambios antes de la producci\u00f3n.',
      'contact.faq.q4': '\u00bfQu\u00e9 es la t\u00e9cnica Snowglobe?',
      'contact.faq.a4': 'Nuestra t\u00e9cnica Snowglobe sella part\u00edculas decorativas flotantes dentro de un vaso de doble pared. Cuando lo agitas, las part\u00edculas giran como una bola de nieve.',
      'contact.faq.q5': '\u00bfHacen env\u00edos internacionales?',
      'contact.faq.a5': 'Actualmente enviamos dentro de Estados Unidos. Env\u00edos internacionales pueden estar disponibles caso por caso \u2014 cont\u00e1ctanos para discutirlo.',
      'contact.faq.q6': '\u00bfCu\u00e1l es su pol\u00edtica de devoluciones?',
      'contact.faq.a6': 'Como cada art\u00edculo es hecho a medida, generalmente no aceptamos devoluciones. Sin embargo, si hay un defecto o no coincide con la prueba aprobada, lo resolveremos.',

      // About Page
      'about.page.title': 'Nuestra Historia',
      'about.page.subtitle': 'Construida sobre amor, cultura y creatividad.',
      'about.values.family': 'Familia Primero',
      'about.values.family.desc': 'Empezamos este negocio para construir algo juntas sin perdernos los momentos importantes.',
      'about.values.culture': 'Orgullo Cultural',
      'about.values.culture.desc': 'Cada dise\u00f1o lleva nuestra identidad Latina \u2014 audaz, vibrante y lleno de significado.',
      'about.values.quality': 'Calidad Artesanal',
      'about.values.quality.desc': 'Materiales premium, t\u00e9cnica meticulosa y atenci\u00f3n personal a cada pieza.',

      // Badges
      'badge.new': 'Nuevo',
      'badge.sold': 'Agotado',
      'badge.custom': 'Personalizado',
      'badge.popular': 'Popular',
      'badge.technique': 'Especial',

      // General
      'general.loading': 'Cargando...',
      'general.error': 'Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.',
      'general.close': 'Cerrar',
      'general.viewall': 'Ver Todo',
    }
  };

  // ---------------------------------------------------------------------------
  // Default Product Catalog
  // ---------------------------------------------------------------------------

  var DEFAULT_PRODUCTS = [
    // --- SHIRTS ---
    { id: 'shirt-latina-vibes', name: { en: 'Latina Vibes Tee', es: 'Camisa Latina Vibes' }, category: 'shirts', price: 2499, badge: 'popular', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop'],
      desc: { en: 'Classic fitted tee with vibrant DTF-printed Latina Vibes design. Premium cotton blend for all-day comfort. Available in multiple colors.', es: 'Camisa cl\u00e1sica con dise\u00f1o vibrante Latina Vibes impreso con DTF. Mezcla premium de algod\u00f3n para comodidad todo el d\u00eda. Disponible en varios colores.' },
      technique: 'dtf', rating: 4.9, reviewCount: 12,
      reviews: [
        { name: 'Maria R.', text: 'Love the quality! The colors are so vibrant.', rating: 5, date: '2026-03-15' },
        { name: 'Sofia L.', text: 'Perfect fit and the design is gorgeous.', rating: 5, date: '2026-03-10' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'Pink', hex: '#F9A8C9' }],
      lowStockThreshold: 3, stockHistory: [] },

    { id: 'shirt-custom-dtf', name: { en: 'Custom DTF Shirt', es: 'Camisa DTF Personalizada' }, category: 'shirts', price: 2499, badge: 'custom', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop'],
      desc: { en: 'Your design, your shirt. Send us any image and we\'ll DTF print it in stunning detail. 3-7 business day turnaround.', es: 'Tu dise\u00f1o, tu camisa. Env\u00edanos cualquier imagen y la imprimiremos con DTF en detalle impresionante. 3-7 d\u00edas h\u00e1biles.' },
      technique: 'dtf', rating: 5.0, reviewCount: 8,
      reviews: [
        { name: 'Ana M.', text: 'They printed my dog\'s photo perfectly! Amazing quality.', rating: 5, date: '2026-02-28' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1A1A1A' }],
      lowStockThreshold: 3, stockHistory: [] },

    // --- SWEATERS ---
    { id: 'sweater-buzo-rosa', name: { en: 'Rosa Crewneck Sweater', es: 'Buzo Crewneck Rosa' }, category: 'sweaters', price: 2999, badge: 'new', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=600&fit=crop'],
      desc: { en: 'Cozy crewneck sweater with custom DTF design. Soft fleece-lined interior. Perfect for cool Miami evenings.', es: 'Buzo acogedor con dise\u00f1o DTF personalizado. Interior suave con forro polar. Perfecto para las noches frescas de Miami.' },
      technique: 'dtf', rating: 4.8, reviewCount: 6,
      reviews: [
        { name: 'Carolina P.', text: 'So soft and the print looks professional!', rating: 5, date: '2026-03-01' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Gray', hex: '#6B7280' }, { name: 'Pink', hex: '#F9A8C9' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1E3A5F' }],
      lowStockThreshold: 3, stockHistory: [] },

    // --- HOODIES ---
    { id: 'hoodie-capucha-custom', name: { en: 'Custom Hoodie', es: 'Hoodie Personalizado' }, category: 'hoodies', price: 3499, badge: 'custom', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1556821862-33e48c573788?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1556821862-33e48c573788?w=600&h=600&fit=crop'],
      desc: { en: 'Heavyweight hoodie with your custom design. Kangaroo pocket, double-lined hood, ribbed cuffs. DTF or vinyl print options.', es: 'Hoodie de peso pesado con tu dise\u00f1o personalizado. Bolsillo canguro, capucha doble forro, pu\u00f1os acanalados. Opciones de impresi\u00f3n DTF o vinil.' },
      technique: 'dtf', rating: 4.9, reviewCount: 4,
      reviews: [
        { name: 'Luis B.', text: 'Heavy duty quality. Print is flawless.', rating: 5, date: '2026-02-20' }
      ],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Gray', hex: '#6B7280' }, { name: 'White', hex: '#FFFFFF' }],
      lowStockThreshold: 3, stockHistory: [] },

    // --- CUPS (Snowglobe Technique) ---
    { id: 'cup-snowglobe-flowers', name: { en: 'Floral Snowglobe Glass', es: 'Vaso Snowglobe Floral' }, category: 'cups', price: 3500, badge: 'technique', inStock: true, stock: 5,
      img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop'],
      desc: { en: 'Stunning snowglobe technique glass can with delicate floral design. Shake to see the magic! Includes bamboo lid and glass straw.', es: 'Impresionante vaso de vidrio con t\u00e9cnica snowglobe y dise\u00f1o floral delicado. \u00a1Agita para ver la magia! Incluye tapa de bamb\u00fa y pajita de vidrio.' },
      technique: 'snowglobe', rating: 5.0, reviewCount: 15,
      reviews: [
        { name: 'Jessica T.', text: 'The snowglobe effect is MAGICAL. Best cup I own!', rating: 5, date: '2026-03-20' },
        { name: 'Daniela V.', text: 'Bought 3 as gifts. Everyone was amazed!', rating: 5, date: '2026-03-18' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 3, stockHistory: [] },

    // --- GLASS CANS ---
    { id: 'glass-goopy-sunset', name: { en: 'Goopy Sunset Glass Can', es: 'Vaso Goopy Atardecer' }, category: 'glass-cans', price: 2499, badge: 'technique', inStock: true, stock: 8,
      img: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&h=600&fit=crop'],
      desc: { en: 'Hand-painted goopy technique glass can with warm sunset colors dripping down the sides. Each one is unique! Comes with bamboo lid and straw.', es: 'Vaso pintado a mano con t\u00e9cnica goopy y colores c\u00e1lidos de atardecer goteando por los lados. \u00a1Cada uno es \u00fanico! Viene con tapa de bamb\u00fa y pajita.' },
      technique: 'goopy', rating: 4.8, reviewCount: 9,
      reviews: [
        { name: 'Valentina G.', text: 'The drip effect is so cool and unique!', rating: 5, date: '2026-03-12' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 3, stockHistory: [] },

    { id: 'glass-lava-red', name: { en: 'Lava Flow Glass Can', es: 'Vaso Lava Rojo' }, category: 'glass-cans', price: 3500, badge: 'technique', inStock: true, stock: 4,
      img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop'],
      desc: { en: 'Mesmerizing lava technique glass can with deep red and orange flow. The texture is incredible to hold. Bamboo lid and glass straw included.', es: 'Hipnotizante vaso con t\u00e9cnica lava en rojo profundo y naranja. La textura es incre\u00edble al tacto. Incluye tapa de bamb\u00fa y pajita de vidrio.' },
      technique: 'lava', rating: 5.0, reviewCount: 7,
      reviews: [
        { name: 'Rosa M.', text: 'The texture is absolutely stunning. A true work of art.', rating: 5, date: '2026-02-25' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 3, stockHistory: [] },

    // --- MUGS ---
    { id: 'mug-sublimation-custom', name: { en: 'Custom Sublimation Mug', es: 'Taza Sublimaci\u00f3n Personalizada' }, category: 'mugs', price: 2399, badge: 'custom', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop'],
      desc: { en: '11oz ceramic mug with full-wrap sublimation printing. Your photo, quote, or design permanently fused into the ceramic. Dishwasher safe!', es: 'Taza cer\u00e1mica de 11oz con impresi\u00f3n de sublimaci\u00f3n completa. Tu foto, frase o dise\u00f1o fusionado permanentemente en la cer\u00e1mica. \u00a1Apta para lavavajillas!' },
      technique: 'sublimation', rating: 4.9, reviewCount: 20,
      reviews: [
        { name: 'Amanda K.', text: 'Made one for my mom with family photos. She cried!', rating: 5, date: '2026-03-08' },
        { name: 'Roberto F.', text: 'Great quality, colors are perfect. Already ordering more.', rating: 5, date: '2026-02-15' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 3, stockHistory: [] },

    // --- TUMBLERS ---
    { id: 'tumbler-zipper-purple', name: { en: 'Zipper Technique Tumbler', es: 'Termo T\u00e9cnica Zipper' }, category: 'tumblers', price: 4500, badge: 'technique', inStock: true, stock: 3,
      img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop'],
      desc: { en: 'Our premium zipper technique tumbler in stunning purple tones. The unique zipper-like texture pattern wraps around the entire tumbler. 20oz stainless steel, keeps drinks hot 6hrs / cold 12hrs.', es: 'Nuestro termo premium con t\u00e9cnica zipper en impresionantes tonos p\u00farpura. El patr\u00f3n \u00fanico tipo cremallera envuelve todo el termo. Acero inoxidable 20oz, mantiene bebidas calientes 6hrs / fr\u00edas 12hrs.' },
      technique: 'zipper', rating: 5.0, reviewCount: 11,
      reviews: [
        { name: 'Camila S.', text: 'The zipper effect is like nothing I\'ve ever seen. Absolutely OBSESSED.', rating: 5, date: '2026-03-22' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 2, stockHistory: [] },

    // --- HATS ---
    { id: 'hat-custom-gorra', name: { en: 'Custom Embroidered Cap', es: 'Gorra Personalizada Bordada' }, category: 'hats', price: 1999, badge: 'custom', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop'],
      desc: { en: 'Structured 6-panel cap with your custom design. Choose vinyl or embroidered lettering. Adjustable snapback closure.', es: 'Gorra estructurada de 6 paneles con tu dise\u00f1o personalizado. Elige vinilo o bordado. Cierre snapback ajustable.' },
      technique: 'standard', rating: 4.7, reviewCount: 5,
      reviews: [
        { name: 'Miguel A.', text: 'Clean embroidery, great hat quality.', rating: 5, date: '2026-01-30' }
      ],
      sizes: [],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'Pink', hex: '#F9A8C9' }, { name: 'Beige', hex: '#D4A853' }],
      lowStockThreshold: 3, stockHistory: [] },

    // --- 3D PRINTS ---
    { id: '3d-custom-design', name: { en: 'Custom 3D Printed Design', es: 'Dise\u00f1o Personalizado 3D' }, category: '3d-prints', price: 2999, badge: 'custom', inStock: true, stock: -1,
      img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop',
      imgs: ['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop'],
      desc: { en: 'Bring your ideas to life with custom 3D printing. Figurines, signs, decor, gifts \u2014 if you can dream it, we can print it. Multiple colors and finishes available.', es: 'Dale vida a tus ideas con impresi\u00f3n 3D personalizada. Figurinas, letreros, decoraci\u00f3n, regalos \u2014 si lo puedes so\u00f1ar, lo podemos imprimir. M\u00faltiples colores y acabados disponibles.' },
      technique: '3d-print', rating: 4.8, reviewCount: 6,
      reviews: [
        { name: 'Carlos D.', text: 'Had them print a custom name sign. Came out perfect!', rating: 5, date: '2026-02-10' }
      ],
      sizes: [], colors: [],
      lowStockThreshold: 3, stockHistory: [] }
  ];

  // ---------------------------------------------------------------------------
  // Default Settings
  // ---------------------------------------------------------------------------

  var DEFAULT_SETTINGS = {
    businessName: 'Latinas Be Like Design',
    email: 'latinasbelikedesign@gmail.com',
    phone: '',
    instagram: 'https://www.instagram.com/latinasbelikedesign/',
    tiktok: '',
    facebook: 'https://www.facebook.com/latinasbymargarita',
    taxRate: 0,
    shippingFlat: 500,
    shippingFreeThreshold: 5000,
    currency: 'USD',
    lowStockDefault: 3
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  function formatPrice(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function safeGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch(e) {
      if (e.name === 'QuotaExceededError') throw new Error('Storage full! Try removing some data.');
      throw e;
    }
  }

  // ---------------------------------------------------------------------------
  // i18n
  // ---------------------------------------------------------------------------

  function getLang() {
    return localStorage.getItem(SK_LANG) || 'en';
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'es') return;
    localStorage.setItem(SK_LANG, lang);
    applyLang();
  }

  function t(key, replacements) {
    var lang = getLang();
    var str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS.en[key]) || key;
    if (replacements) {
      Object.keys(replacements).forEach(function(k) {
        str = str.replace('{' + k + '}', replacements[k]);
      });
    }
    return str;
  }

  function localStr(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    var lang = getLang();
    return obj[lang] || obj.en || obj.es || '';
  }

  function applyLang() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var attr = els[i].getAttribute('data-i18n-attr');
      if (attr) {
        els[i].setAttribute(attr, t(key));
      } else {
        els[i].textContent = t(key);
      }
    }
    document.documentElement.lang = getLang();
  }

  // ---------------------------------------------------------------------------
  // Product functions
  // ---------------------------------------------------------------------------

  function getProducts() {
    return safeGet(SK_PRODUCTS, null) || deepClone(DEFAULT_PRODUCTS);
  }

  function saveProducts(products) {
    safeSet(SK_PRODUCTS, products);
  }

  function getProductById(id) {
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
      if (products[i].variants) {
        for (var v = 0; v < products[i].variants.length; v++) {
          if (products[i].variants[v].id === id) return products[i].variants[v];
        }
      }
    }
    return null;
  }

  function getParentProduct(variantId) {
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (products[i].variants) {
        for (var v = 0; v < products[i].variants.length; v++) {
          if (products[i].variants[v].id === variantId) return products[i];
        }
      }
    }
    return null;
  }

  function getProductsByCategory(cat) {
    return getProducts().filter(function(p) { return p.category === cat; });
  }

  function getFeaturedProducts(count) {
    return getProducts().filter(function(p) { return p.inStock; }).slice(0, count || 8);
  }

  // ---------------------------------------------------------------------------
  // Cart functions
  // ---------------------------------------------------------------------------

  function getCart() { return safeGet(SK_CART, []); }
  function saveCart(cart) { safeSet(SK_CART, cart); }

  function addToCart(id, options) {
    var cart = getCart();
    var cartKey = id + (options && options.size ? '-' + options.size : '') + (options && options.color ? '-' + options.color : '');
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].cartKey === cartKey) { cart[i].qty++; found = true; break; }
    }
    if (!found) {
      cart.push({
        id: id,
        cartKey: cartKey,
        qty: 1,
        size: (options && options.size) || null,
        color: (options && options.color) || null,
        customization: (options && options.customization) || null
      });
    }
    saveCart(cart);
    return getProductById(id);
  }

  function removeFromCart(cartKey) {
    saveCart(getCart().filter(function(item) { return item.cartKey !== cartKey; }));
  }

  function updateQty(cartKey, delta) {
    var cart = getCart();
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].cartKey === cartKey) {
        var nq = cart[i].qty + delta;
        if (nq <= 0) { cart.splice(i, 1); } else { cart[i].qty = nq; }
        break;
      }
    }
    saveCart(cart);
  }

  function getCartCount() {
    var cart = getCart(), count = 0;
    for (var i = 0; i < cart.length; i++) count += cart[i].qty;
    return count;
  }

  function getCartTotal() {
    var cart = getCart(), products = getProducts(), total = 0;
    for (var c = 0; c < cart.length; c++) {
      var pid = cart[c].id;
      for (var p = 0; p < products.length; p++) {
        if (products[p].id === pid) { total += products[p].price * cart[c].qty; break; }
        if (products[p].variants) {
          for (var v = 0; v < products[p].variants.length; v++) {
            if (products[p].variants[v].id === pid) { total += products[p].variants[v].price * cart[c].qty; }
          }
        }
      }
    }
    return total;
  }

  function clearCart() { localStorage.removeItem(SK_CART); }

  // ---------------------------------------------------------------------------
  // Wishlist
  // ---------------------------------------------------------------------------

  function getWishlist() { return safeGet(SK_WISHLIST, []); }
  function addToWishlist(id) {
    var wl = getWishlist();
    if (wl.indexOf(id) === -1) wl.push(id);
    safeSet(SK_WISHLIST, wl);
  }
  function removeFromWishlist(id) {
    safeSet(SK_WISHLIST, getWishlist().filter(function(x) { return x !== id; }));
  }
  function isInWishlist(id) { return getWishlist().indexOf(id) !== -1; }

  // ---------------------------------------------------------------------------
  // Custom Orders
  // ---------------------------------------------------------------------------

  function getCustomOrders() { return safeGet(SK_CUSTOM, []); }

  function saveCustomOrder(order) {
    var orders = getCustomOrders();
    order.id = order.id || 'CO-' + Date.now().toString(36).toUpperCase();
    order.status = order.status || 'quote-requested';
    order.createdAt = order.createdAt || new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.push(order);
    safeSet(SK_CUSTOM, orders);
    return order;
  }

  function updateCustomOrderStatus(id, status, note) {
    var orders = getCustomOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) {
        orders[i].status = status;
        orders[i].updatedAt = new Date().toISOString();
        if (note) {
          orders[i].notes = orders[i].notes || [];
          orders[i].notes.push({ text: note, date: new Date().toISOString() });
        }
        break;
      }
    }
    safeSet(SK_CUSTOM, orders);
  }

  // ---------------------------------------------------------------------------
  // Orders (standard purchases)
  // ---------------------------------------------------------------------------

  function getOrders() { return safeGet(SK_ORDERS, []); }

  function saveOrder(order) {
    var orders = getOrders();
    order.id = order.id || 'ORD-' + Date.now().toString(36).toUpperCase();
    order.status = order.status || 'pending';
    order.createdAt = order.createdAt || new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.push(order);
    safeSet(SK_ORDERS, orders);

    // Auto-decrement stock
    if (order.items) {
      var products = getProducts();
      for (var i = 0; i < order.items.length; i++) {
        for (var p = 0; p < products.length; p++) {
          if (products[p].id === order.items[i].id && products[p].stock > 0) {
            products[p].stock -= order.items[i].qty;
            if (products[p].stock <= 0) { products[p].stock = 0; products[p].inStock = false; }
            products[p].stockHistory = products[p].stockHistory || [];
            products[p].stockHistory.push({ date: new Date().toISOString(), delta: -order.items[i].qty, reason: 'Order ' + order.id, by: 'system' });
          }
        }
      }
      saveProducts(products);
    }
    return order;
  }

  function updateOrderStatus(id, status, note) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) {
        orders[i].status = status;
        orders[i].updatedAt = new Date().toISOString();
        if (note) {
          orders[i].notes = orders[i].notes || [];
          orders[i].notes.push({ text: note, date: new Date().toISOString() });
        }
        break;
      }
    }
    safeSet(SK_ORDERS, orders);
  }

  // ---------------------------------------------------------------------------
  // Inventory Management
  // ---------------------------------------------------------------------------

  function getStockLevel(productId) {
    var p = getProductById(productId);
    return p ? (p.stock !== undefined ? p.stock : -1) : 0;
  }

  function updateStock(productId, delta, reason) {
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === productId) {
        if (products[i].stock === -1) return; // made-to-order, no stock tracking
        products[i].stock = Math.max(0, (products[i].stock || 0) + delta);
        products[i].inStock = products[i].stock > 0;
        products[i].stockHistory = products[i].stockHistory || [];
        products[i].stockHistory.push({ date: new Date().toISOString(), delta: delta, reason: reason || 'Manual adjustment', by: 'admin' });
        break;
      }
    }
    saveProducts(products);
  }

  function getLowStockItems(threshold) {
    var t = threshold || 3;
    return getProducts().filter(function(p) {
      return p.stock !== -1 && p.stock >= 0 && p.stock <= t;
    });
  }

  function getStockHistory(productId) {
    var p = getProductById(productId);
    return (p && p.stockHistory) ? p.stockHistory : [];
  }

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  function getAnalytics() { return safeGet(SK_ANALYTICS, { views: {}, cartAdds: {}, dailyRevenue: {} }); }

  function trackView(productId) {
    var a = getAnalytics();
    a.views[productId] = (a.views[productId] || 0) + 1;
    safeSet(SK_ANALYTICS, a);
  }

  function trackAddToCart(productId) {
    var a = getAnalytics();
    a.cartAdds[productId] = (a.cartAdds[productId] || 0) + 1;
    safeSet(SK_ANALYTICS, a);
  }

  function trackRevenue(amount) {
    var a = getAnalytics();
    var today = new Date().toISOString().slice(0, 10);
    a.dailyRevenue[today] = (a.dailyRevenue[today] || 0) + amount;
    safeSet(SK_ANALYTICS, a);
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  function getSettings() { return safeGet(SK_SETTINGS, null) || deepClone(DEFAULT_SETTINGS); }
  function saveSettings(s) { safeSet(SK_SETTINGS, s); }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  function exportJSON() {
    return JSON.stringify({
      products: getProducts(),
      orders: getOrders(),
      customOrders: getCustomOrders(),
      analytics: getAnalytics(),
      settings: getSettings()
    }, null, 2);
  }

  function importJSON(jsonStr) {
    var parsed = JSON.parse(jsonStr);
    if (parsed.products) {
      if (!Array.isArray(parsed.products)) throw new Error('Products must be an array');
      for (var i = 0; i < parsed.products.length; i++) {
        if (!parsed.products[i].id || !parsed.products[i].name) throw new Error('Product at index ' + i + ' missing id or name');
      }
      saveProducts(parsed.products);
    }
    if (parsed.orders) safeSet(SK_ORDERS, parsed.orders);
    if (parsed.customOrders) safeSet(SK_CUSTOM, parsed.customOrders);
    if (parsed.settings) saveSettings(parsed.settings);
    return { products: (parsed.products || []).length, orders: (parsed.orders || []).length };
  }

  function resetToDefaults() {
    localStorage.removeItem(SK_PRODUCTS);
    localStorage.removeItem(SK_ORDERS);
    localStorage.removeItem(SK_CUSTOM);
    localStorage.removeItem(SK_ANALYTICS);
    localStorage.removeItem(SK_SETTINGS);
  }

  // ---------------------------------------------------------------------------
  // Image resize utility
  // ---------------------------------------------------------------------------

  function resizeImage(dataUri, maxWidth, callback) {
    var img = new Image();
    img.onload = function() {
      if (img.width <= maxWidth) { callback(dataUri); return; }
      var canvas = document.createElement('canvas');
      var ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUri;
  }

  function getStorageSize() {
    var total = 0;
    var keys = [SK_PRODUCTS, SK_CART, SK_ORDERS, SK_CUSTOM, SK_ANALYTICS, SK_SETTINGS, SK_WISHLIST, SK_INVENTORY];
    var details = {};
    for (var i = 0; i < keys.length; i++) {
      var v = localStorage.getItem(keys[i]) || '';
      details[keys[i]] = v.length;
      total += v.length;
    }
    details.total = total;
    return details;
  }

  // ---------------------------------------------------------------------------
  // Cross-tab sync
  // ---------------------------------------------------------------------------

  window.addEventListener('storage', function(e) {
    if (e.key && e.key.indexOf('lbld_') === 0) {
      if (typeof window.LBLDData.onSync === 'function') {
        window.LBLDData.onSync(e.key, e.newValue);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.LBLDData = {
    // Constants
    CATEGORIES: CATEGORIES,
    BADGES: BADGES,
    TECHNIQUES: TECHNIQUES,
    ORDER_STATUSES: ORDER_STATUSES,
    SIZES: SIZES,
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,

    // i18n
    getLang: getLang,
    setLang: setLang,
    t: t,
    localStr: localStr,
    applyLang: applyLang,

    // Products
    getProducts: getProducts,
    saveProducts: saveProducts,
    getProductById: getProductById,
    getParentProduct: getParentProduct,
    getProductsByCategory: getProductsByCategory,
    getFeaturedProducts: getFeaturedProducts,
    generateId: generateId,

    // Cart
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    clearCart: clearCart,

    // Wishlist
    getWishlist: getWishlist,
    addToWishlist: addToWishlist,
    removeFromWishlist: removeFromWishlist,
    isInWishlist: isInWishlist,

    // Custom Orders
    getCustomOrders: getCustomOrders,
    saveCustomOrder: saveCustomOrder,
    updateCustomOrderStatus: updateCustomOrderStatus,

    // Orders
    getOrders: getOrders,
    saveOrder: saveOrder,
    updateOrderStatus: updateOrderStatus,

    // Inventory
    getStockLevel: getStockLevel,
    updateStock: updateStock,
    getLowStockItems: getLowStockItems,
    getStockHistory: getStockHistory,

    // Analytics
    getAnalytics: getAnalytics,
    trackView: trackView,
    trackAddToCart: trackAddToCart,
    trackRevenue: trackRevenue,

    // Settings
    getSettings: getSettings,
    saveSettings: saveSettings,

    // Export / Import
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetToDefaults: resetToDefaults,

    // Utilities
    resizeImage: resizeImage,
    getStorageSize: getStorageSize,
    formatPrice: formatPrice,
    deepClone: deepClone,

    // Sync callback
    onSync: null
  };
})();
