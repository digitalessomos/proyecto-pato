/**
 * Catálogo Data-Driven de Delicias - Pastelería Pato (Haedo, Buenos Aires)
 * 
 * Modularizado y desacoplado, compatible tanto con inclusión directa en navegador (file:///)
 * como con módulos ESM y sincronización con Firebase Cloud Firestore.
 */

export const productsData = [
  {
    id: "rogel-artesanal",
    nombre: "Rogel Clásico Argentino",
    categoria: "tortas",
    precio: 18500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    descripcion: "Ocho finas capas crocantes unidas por generoso dulce de leche repostero y coronadas con coposo merengue italiano.",
    destacado: true,
    etiqueta: "Especialidad",
    disponible: true
  },
  {
    id: "chocotorta-suprema",
    nombre: "Chocotorta Suprema Artesanal",
    categoria: "tortas",
    precio: 17000,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    descripcion: "El clásico argentino elevado: chocolinas embebidas en café suave, crema de dulce de leche y queso crema, con virutas de chocolate.",
    destacado: true,
    etiqueta: "La Favorita",
    disponible: true
  },
  {
    id: "marquise-frutos-rojos",
    nombre: "Marquise con Frutos Rojos",
    categoria: "tortas",
    precio: 19500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
    descripcion: "Base súper húmeda de puro chocolate, dulce de leche repostero colonial, suave crema chantilly y frutos rojos frescos.",
    destacado: true,
    etiqueta: "Imperdible",
    disponible: true
  },
  {
    id: "lemon-pie-clasico",
    nombre: "Lemon Pie Tradicional",
    categoria: "tartas",
    precio: 13500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
    descripcion: "Masa sableé crocante de manteca, cuajada cítrica de limones naturales y copetes tostados de merengue italiano.",
    destacado: true,
    etiqueta: "Clásico de Pato",
    disponible: true
  },
  {
    id: "tarta-frutillas-pastelera",
    nombre: "Tarta de Frutillas con Pastelera",
    categoria: "tartas",
    precio: 14500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=600&q=80",
    descripcion: "Base crocante, crema pastelera suave aromatizada a la vainilla bourbon y abundante cubierta de frutillas frescas abrillantadas.",
    destacado: true,
    etiqueta: "De Temporada",
    disponible: true
  },
  {
    id: "tarta-havannet",
    nombre: "Tarta Bombón Tipo Havannet",
    categoria: "tartas",
    precio: 14000,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    descripcion: "Masa sableé de cacao, colchón abundante de dulce de leche repostero y baño satinado de ganache de chocolate semiamargo.",
    destacado: false,
    etiqueta: "Puro Chocolate",
    disponible: true
  },
  {
    id: "tarta-ricota-casera",
    nombre: "Tarta de Ricota Tradicional",
    categoria: "tartas",
    precio: 11500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80",
    descripcion: "Receta familiar tradicional, relleno suave y cremoso con ralladura fresca de limón y espolvoreada con azúcar impalpable.",
    destacado: false,
    etiqueta: "Receta Casera",
    disponible: true
  },
  {
    id: "crumble-manzanas",
    nombre: "Crumble de Manzanas y Canela",
    categoria: "tartas",
    precio: 12500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80",
    descripcion: "Manzanas caramelizadas con canela bajo una lluvia crocante de manteca dorada, azúcar rubia y avena tostada.",
    destacado: false,
    etiqueta: "Para el Té",
    disponible: true
  },
  {
    id: "alfajores-maicena-box",
    nombre: "Alfajores de Maicena (Caja x 6)",
    categoria: "alfajores",
    precio: 6500,
    unidad: "caja",
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    descripcion: "Masa súper suave que se deshace en la boca, extra dulce de leche repostero y rebosados en coco rallado fino.",
    destacado: true,
    etiqueta: "Tradición",
    disponible: true
  },
  {
    id: "alfajores-marplatenses",
    nombre: "Alfajor Marplatense (Caja x 6)",
    categoria: "alfajores",
    precio: 8200,
    unidad: "caja",
    imagen: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
    descripcion: "Tapas esponjosas con toque de miel y cacao, mucho dulce de leche y baño en chocolate cobertura semiamargo 70%.",
    destacado: false,
    etiqueta: "Artesanal",
    disponible: true
  },
  {
    id: "masas-finas-surtidas",
    nombre: "Masas Finas Surtidas (500g)",
    categoria: "alfajores",
    precio: 12000,
    unidad: "bandeja",
    imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    descripcion: "Selección de mini tarteletitas, barquillos rellenos, coquitos dorados, palmitas y petit fours finos.",
    destacado: false,
    etiqueta: "Surtido Fino",
    disponible: true
  },
  {
    id: "medialunas-manteca-docena",
    nombre: "Medialunas de Manteca (Docena)",
    categoria: "budines",
    precio: 7800,
    unidad: "docena",
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    descripcion: "Esponjosas y hojaldradas, elaboradas con 100% manteca de primera y bañadas en almíbar dulce recién horneadas.",
    destacado: true,
    etiqueta: "Recién Horneadas",
    disponible: true
  },
  {
    id: "scones-queso-box",
    nombre: "Scones Caseros de Queso (x 6)",
    categoria: "budines",
    precio: 5200,
    unidad: "caja",
    imagen: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    descripcion: "Tibios, esponjosos y con el toque justo de queso parmesano reggiano. Ideales para el mate o la merienda.",
    destacado: false,
    etiqueta: "Salados de Pato",
    disponible: true
  },
  {
    id: "budin-limon-amapolas",
    nombre: "Budín Húmedo de Limón y Amapolas",
    categoria: "budines",
    precio: 6800,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80",
    descripcion: "Extra húmedo con jugo natural y semillas de amapola, cubierto con generoso glaseado cítrico crocante.",
    destacado: false,
    etiqueta: "Favorito del Té",
    disponible: true
  },
  {
    id: "budin-marmolado-fudge",
    nombre: "Budín Marmolado Vainilla y Fudge",
    categoria: "budines",
    precio: 6500,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=600&q=80",
    descripcion: "Espirales de vainilla y cacao amargo, con hilos de chocolate con leche en la cubierta. Esponjoso y rendidor.",
    destacado: false,
    etiqueta: "Para la Merienda",
    disponible: true
  },
  {
    id: "box-merienda-cumple",
    nombre: "Box Regalo Merienda / Cumpleaños",
    categoria: "budines",
    precio: 22000,
    unidad: "unidad",
    imagen: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80",
    descripcion: "Caja kraft con mini torta a elección, 2 alfajores de maicena, 2 medialunas, scones, jugo y tarjeta personalizada con dedicatoria.",
    destacado: true,
    etiqueta: "Para Festejar",
    disponible: true
  }
];

export const storeInfo = (typeof window !== "undefined" && window.STORE_CONFIG) 
  ? window.STORE_CONFIG 
  : {
      nombre: "Pastelería Pato",
      dueno: "Pato",
      subtitulo: "Tortas, Tartas y Delicias Artesanales",
      eslogan: "El auténtico sabor casero en cada bocado, horneado con amor",
      direccion: "Nervo y Lainez",
      localidad: "Haedo, Buenos Aires",
      telefonoWhatsApp: "5491159665917",
      horarios: "Martes a Sábados de 9:00 a 13:00 y 16:00 a 20:00 hs | Domingos de 9:30 a 13:30 hs",
      estadoActual: "Abierto hoy",
      cartelOriginal: ""
    };

export const categoriesData = [
  { id: "todos", nombre: "Todo el Menú", icono: "🧁" },
  { id: "tortas", nombre: "Tortas y Cakes", icono: "🎂" },
  { id: "tartas", nombre: "Tartas Dulces", icono: "🥧" },
  { id: "alfajores", nombre: "Alfajores y Masas", icono: "🍪" },
  { id: "budines", nombre: "Budines y Meriendas", icono: "🥐" }
];

export const INITIAL_PRODUCTS = productsData;
export const CATEGORIES = categoriesData;

if (typeof window !== "undefined") {
  window.productsData = productsData;
  window.storeInfo = storeInfo;
  window.categoriesData = categoriesData;
  window.INITIAL_PRODUCTS = productsData;
  window.CATEGORIES = categoriesData;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { productsData, storeInfo, categoriesData, INITIAL_PRODUCTS, CATEGORIES };
}

export default { productsData, storeInfo, categoriesData, INITIAL_PRODUCTS, CATEGORIES };
