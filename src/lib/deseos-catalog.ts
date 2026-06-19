export type CatalogItem = {
  id: string;
  title: string;
  category: "Libro" | "Experiencia" | "Curso" | "Actividad" | "Producto";
  image: string;
  cta: string;
};

export const DESEOS_CATALOG: CatalogItem[] = [
  {
    id: "libro-jung",
    title: "El Hombre y sus Símbolos — Carl Jung",
    category: "Libro",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    cta: "Leer más",
  },
  {
    id: "retiro-silencio",
    title: "Retiro de Silencio Vipassana",
    category: "Experiencia",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
    cta: "Descubrir",
  },
  {
    id: "curso-lucidos",
    title: "Iniciación a los Sueños Lúcidos",
    category: "Curso",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    cta: "Inscribirme",
  },
  {
    id: "act-journaling",
    title: "Diario Onírico Nocturno",
    category: "Actividad",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    cta: "Empezar",
  },
  {
    id: "prod-aroma",
    title: "Aceite Esencial de Lavanda Profunda",
    category: "Producto",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    cta: "Ver producto",
  },
  {
    id: "exp-flotacion",
    title: "Sesión de Tanque de Flotación",
    category: "Experiencia",
    image: "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80",
    cta: "Reservar",
  },
  {
    id: "curso-meditacion",
    title: "Meditación para el Subconsciente",
    category: "Curso",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    cta: "Comenzar",
  },
  {
    id: "act-caminata",
    title: "Caminata Consciente al Amanecer",
    category: "Actividad",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    cta: "Planificar",
  },
];