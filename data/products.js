/**
 * Catálogo Data-Driven de Productos - Pastelería Pato (Nervo y Laínez, Haedo)
 * 
 * Modularizado y desacoplado, compatible con Alpine.js, almacenamiento en localStorage
 * y sincronización bidireccional entre la tienda y el panel de administración.
 */

(function (root, factory) {
  const data = factory();
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = data;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.productsData = data.productsData;
    root.storeInfo = data.storeInfo;
    root.categoriesData = data.categoriesData;
  }
})(typeof self !== "undefined" ? self : this, function () {

  const productsData = [
    {
      id: "torta-rogel",
      nombre: "Torta Rogel Artesanal",
      categoria: "tortas",
      precio: 18500,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
      descripcion: "8 capas de masa crocante casera, abundante dulce de leche repostero y copete de merengue italiano flambeado.",
      destacado: true,
      etiqueta: "Especialidad de Pato",
      disponible: true
    },
    {
      id: "chocotorta-clasica",
      nombre: "Chocotorta Clásica Argentina",
      categoria: "tortas",
      precio: 16500,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80",
      descripcion: "Capas de galletitas Chocolinas embebidas en café suave, crema intensa de dulce de leche y queso crema premium.",
      destacado: true,
      etiqueta: "La Más Pedida",
      disponible: true
    },
    {
      id: "lemon-pie-merengado",
      nombre: "Lemon Pie Merengado",
      categoria: "tortas",
      precio: 15500,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
      descripcion: "Base de masa sablée de manteca, crema cuajada de jugo de limón natural y corona de merengue suizo dorado al soplete.",
      destacado: true,
      etiqueta: "Clásico del Té",
      disponible: true
    },
    {
      id: "cheesecake-frutos-rojos",
      nombre: "Cheesecake con Frutos Rojos",
      categoria: "tortas",
      precio: 19000,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
      descripcion: "Textura sedosa horneada lentamente, base crocante y coulis artesanal de frambuesas, moras y arándanos.",
      destacado: true,
      etiqueta: "Gourmet",
      disponible: true
    },
    {
      id: "tarta-frutillas-pastelera",
      nombre: "Tarta de Frutillas con Pastelera",
      categoria: "tortas",
      precio: 16000,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
      descripcion: "Masa dulce crocante, generosa crema pastelera aromatizada con vaina de vainilla y frutillas frescas abrillantadas.",
      destacado: true,
      etiqueta: "Frescura del Día",
      disponible: true
    },
    {
      id: "selva-negra-artesanal",
      nombre: "Torta Selva Negra Tradicional",
      categoria: "tortas",
      precio: 18000,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80",
      descripcion: "Bizcochuelo húmedo de cacao amargo, crema chantilly fresca, cerezas al marrasquino y lluvia de chocolate belga.",
      destacado: false,
      etiqueta: "Tradición Europea",
      disponible: true
    },
    {
      id: "medialunas-manteca-docena",
      nombre: "Medialunas de Manteca (Docena)",
      categoria: "facturas",
      precio: 7200,
      unidad: "docena",
      imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      descripcion: "Hojaldre 100% pura manteca, esponjosas, tiernas y bañadas en almíbar perfumado con cítricos.",
      destacado: true,
      etiqueta: "Recién Horneadas",
      disponible: true
    },
    {
      id: "medialunas-grasa-docena",
      nombre: "Medialunas de Grasa Saladas (Docena)",
      categoria: "facturas",
      precio: 6800,
      unidad: "docena",
      imagen: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80",
      descripcion: "Crocantes, hojaldradas y en su punto justo de sal. Las compañeras infaltables para los mates en Haedo.",
      destacado: false,
      etiqueta: "Para el Mate",
      disponible: true
    },
    {
      id: "facturas-surtidas-docena",
      nombre: "Facturas Surtidas del Obrador (Docena)",
      categoria: "facturas",
      precio: 7500,
      unidad: "docena",
      imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      descripcion: "Variedad de vigilantes, cañoncitos de dulce de leche, tortitas negras, bolas de fraile y molinetes con pastelera.",
      destacado: true,
      etiqueta: "Surtido Completo",
      disponible: true
    },
    {
      id: "alfajores-maicena-docena",
      nombre: "Alfajorcitos de Maicena (Docena)",
      categoria: "alfajores",
      precio: 6500,
      unidad: "docena",
      imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
      descripcion: "Tapas suaves que se deshacen en la boca, relleno generoso de dulce de leche colonial y rebozados en coco rallado fino.",
      destacado: true,
      etiqueta: "Caseros de Verdad",
      disponible: true
    },
    {
      id: "alfajores-marplatenses-caja",
      nombre: "Alfajores Marplatenses (Caja x6)",
      categoria: "alfajores",
      precio: 5400,
      unidad: "caja",
      imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
      descripcion: "Masa especiada con un toque de miel y naranja, doble dulce de leche repostero y baño de chocolate semiamargo.",
      destacado: true,
      etiqueta: "Chocolate Puro",
      disponible: true
    },
    {
      id: "masas-finas-kilo",
      nombre: "Masas Finas Surtidas",
      categoria: "alfajores",
      precio: 14000,
      unidad: "kg",
      imagen: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80",
      descripcion: "Tartaletas frutales, fosforitos glaseados, bombones rellenos, merenguitos y masitas secas surtidas al kilo.",
      destacado: false,
      etiqueta: "Mesa Dulce",
      disponible: true
    },
    {
      id: "tarta-toffee-chocolate",
      nombre: "Tarta Toffee & Dulce de Leche",
      categoria: "tortas",
      precio: 15000,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80",
      descripcion: "Crocante masa de chocolate, corazón cremoso de dulce de leche repostero y ganache brillante de chocolate semiamargo.",
      destacado: false,
      etiqueta: "Para Chocolateros",
      disponible: true
    },
    {
      id: "budin-limon-amapolas",
      nombre: "Budín Húmedo de Limón y Amapolas",
      categoria: "postres",
      precio: 5200,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1605698802004-9407aa7113f3?auto=format&fit=crop&w=600&q=80",
      descripcion: "Elaborado con manteca y ralladura fresca de limones seleccionados, semillas de amapola y glaseado crocante.",
      destacado: false,
      etiqueta: "Hora del Mate",
      disponible: true
    },
    {
      id: "tarta-ricota-casera",
      nombre: "Tarta de Ricota Tradicional",
      categoria: "postres",
      precio: 11000,
      unidad: "unidad",
      imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
      descripcion: "Masa frola suave de vainilla rellena de ricota fresca aromatizada con ralladura de limón y azúcar impalpable.",
      destacado: false,
      etiqueta: "Receta de la Abuela",
      disponible: true
    },
    {
      id: "shots-dulces-pack",
      nombre: "Shots Dulces Variados (Pack x4)",
      categoria: "postres",
      precio: 7600,
      unidad: "caja",
      imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      descripcion: "Copitas individuales para eventos o antojos: 1 Chocotorta, 1 Oreo Cream, 1 Lemon Pie y 1 Mousse de Maracuyá.",
      destacado: true,
      etiqueta: "Pack Degustación",
      disponible: true
    }
  ];

  const storeInfo = (typeof window !== "undefined" && window.STORE_CONFIG) 
    ? window.STORE_CONFIG 
    : {
        nombre: "Pastelería Pato",
        dueno: "Pato",
        subtitulo: "Pastelería & Repostería Artesanal",
        eslogan: "Dulzura Artesanal, Calidad y Pasión por la Repostería",
        direccion: "Nervo y Laínez",
        localidad: "Haedo, Buenos Aires",
        telefonoWhatsApp: "5491159665917",
        horarios: "Martes a Domingos de 9:00 a 13:00 y 16:00 a 20:00 hs",
        estadoActual: "Abierto hoy",
        cartelOriginal: "img/Screenshot_20260905_142644_WhatsApp.jpg"
      };

  const categoriesData = [
    { id: "todos", nombre: "Todas las Delicias", icono: "🍰" },
    { id: "tortas", nombre: "Tortas & Tartas", icono: "🎂" },
    { id: "facturas", nombre: "Facturas & Medialunas", icono: "🥐" },
    { id: "alfajores", nombre: "Alfajores & Masas", icono: "🍪" },
    { id: "postres", nombre: "Postres & Budines", icono: "🧁" }
  ];

  return { productsData, storeInfo, categoriesData };
});
