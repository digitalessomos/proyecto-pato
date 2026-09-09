/**
 * Catálogo Data-Driven de Productos - Verdulería Roli (Villa Luzuriaga)
 * 
 * Modularizado y desacoplado, compatible tanto con inclusión directa en navegador (file:///)
 * como con entornos de módulos para la futura integración con Firebase Firestore.
 */

export const productsData = [
    {
      id: "mandarina-criolla",
      nombre: "Mandarina Dulce",
      categoria: "citricos",
      precio: 1300,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80",
      descripcion: "Súper jugosa, fácil de pelar y a precio imbatible del barrio.",
      destacado: true,
      etiqueta: "Súper Oferta",
      disponible: true
    },
    {
      id: "limon-seleccionado",
      nombre: "Limón Amarillo",
      categoria: "citricos",
      precio: 2000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80",
      descripcion: "Cáscara fina, cargado de jugo natural. Ideal ensaladas y milanesas.",
      destacado: false,
      etiqueta: "Del Día",
      disponible: true
    },
    {
      id: "papa-seleccionada",
      nombre: "Papa Blanca / Negra",
      categoria: "verduras",
      precio: 2500,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
      descripcion: "Firme, limpia y rendidora para puré, horno o fritas.",
      destacado: true,
      etiqueta: "Infaltable",
      disponible: true
    },
    {
      id: "manzana-roja",
      nombre: "Manzana Roja Elegida",
      categoria: "frutas",
      precio: 3000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
      descripcion: "Crocante, dulce y brillante. Selección de primera calidad.",
      destacado: true,
      etiqueta: "Seleccionada",
      disponible: true
    },
    {
      id: "zapallito-verde",
      nombre: "Zapallito Verde de Huerta",
      categoria: "verduras",
      precio: 3500,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=600&q=80",
      descripcion: "Tiernos y frescos para rellenos, revueltos o tartas caseras.",
      destacado: false,
      etiqueta: "Fresco de Quinta",
      disponible: true
    },
    {
      id: "banana-seleccion",
      nombre: "Banana Seleccionada",
      categoria: "frutas",
      precio: 3500,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
      descripcion: "En su punto justo de maduración, dulce y nutritiva.",
      destacado: true,
      etiqueta: "Sabor Premium",
      disponible: true
    },
    {
      id: "berenjena-fresca",
      nombre: "Berenjena Negra",
      categoria: "verduras",
      precio: 4000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
      descripcion: "Piel firme y brillante, sin semillas amargas. Ideal al escabeche.",
      destacado: false,
      etiqueta: "Frescura Total",
      disponible: true
    },
    {
      id: "morron-verde",
      nombre: "Morrón Verde",
      categoria: "verduras",
      precio: 4000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80",
      descripcion: "Carnoso y aromático para salsas, guisos y salteados.",
      destacado: false,
      etiqueta: "Aromático",
      disponible: true
    },
    {
      id: "morron-rojo",
      nombre: "Morrón Rojo Dulce",
      categoria: "verduras",
      precio: 5000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
      descripcion: "Grueso, dulce y de intenso color rojo para asados y salsas.",
      destacado: true,
      etiqueta: "Calidad Primera",
      disponible: true
    },
    {
      id: "tomate-redondo",
      nombre: "Tomate Redondo Firme",
      categoria: "verduras",
      precio: 2800,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
      descripcion: "Perfecto para ensaladas diarias, carnoso y con sabor a tomate.",
      destacado: true,
      etiqueta: "Súper Fresco",
      disponible: true
    },
    {
      id: "naranja-jugo",
      nombre: "Naranja de Jugo",
      categoria: "citricos",
      precio: 1800,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80",
      descripcion: "Abundante jugo dulce para arrancar las mañanas con energía.",
      destacado: false,
      etiqueta: "Puro Jugo",
      disponible: true
    },
    {
      id: "cebolla-verdeo",
      nombre: "Cebolla de Verdeo",
      categoria: "verduras",
      precio: 1200,
      unidad: "atado",
      imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
      descripcion: "Atado con hojas crocantes y tallo bien fresco para sazonar.",
      destacado: false,
      etiqueta: "Del Huerto",
      disponible: true
    },
    {
      id: "frutillas-bandeja",
      nombre: "Frutillas Seleccionadas",
      categoria: "frutas",
      precio: 3800,
      unidad: "bandeja",
      imagen: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
      descripcion: "Bandejas cuidadas, color rojo rubí, dulces y aromáticas.",
      destacado: true,
      etiqueta: "Temporada",
      disponible: true
    },
    {
      id: "zanahoria-fresca",
      nombre: "Zanahoria Elegida",
      categoria: "verduras",
      precio: 1500,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
      descripcion: "Crocante, dulce y lavada. Ideal rallada o cocida.",
      destacado: false,
      etiqueta: "Económica",
      disponible: true
    },
    {
      id: "cebolla-comun",
      nombre: "Cebolla Dorada",
      categoria: "verduras",
      precio: 1400,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
      descripcion: "Firme, seca y de excelente tamaño para la cocina diaria.",
      destacado: false,
      etiqueta: "Básico del Hogar",
      disponible: true
    }
  ];

export const storeInfo = (typeof window !== "undefined" && window.STORE_CONFIG) 
  ? window.STORE_CONFIG 
  : {
      nombre: "Verdulería Tefy",
      dueno: "Tefy",
      subtitulo: "Kiosco, Almacén y Verdulería de Barrio",
      eslogan: "Frescura de Verdad, Calidad y Precios del Día",
      direccion: "Guido Spano y Carrasco",
      localidad: "Villa Luzuriaga, Buenos Aires",
      telefonoWhatsApp: "5491159665917",
      horarios: "Lunes a Sábados de 8:30 a 13:30 y 16:30 a 20:30 hs",
      estadoActual: "Abierto hoy",
      cartelOriginal: "img/Screenshot_20260905_142644_WhatsApp.jpg"
    };

export const categoriesData = [
  { id: "todos", nombre: "Todo el Puesto", icono: "🧺" },
  { id: "verduras", nombre: "Verduras y Huerta", icono: "🥬" },
  { id: "frutas", nombre: "Frutas Dulces", icono: "🍎" },
  { id: "citricos", nombre: "Cítricos y Jugo", icono: "🍊" }
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
