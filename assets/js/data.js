/* ==========================================================
   Isbell Centro Estético — datos del sitio
   Edita este archivo para actualizar servicios, precios,
   horarios y datos de contacto. Todo el sitio se actualiza solo.
   ========================================================== */
window.ISBELL = {
  negocio: {
    nombre: "Isbell Centro Estético",
    lema: "Especialistas en tu belleza y bienestar.",
    whatsapp: "593999202820",          // 0999202820 en formato internacional
    whatsappVisible: "099 920 2820",
    direccion: "Abraham Calazacón #43 y Geranios",
    mapaConsulta: "Abraham Calazacón y Geranios, Santo Domingo, Ecuador", // verificar ubicación exacta
    horario: "Por confirmar",          // reemplazar cuando Isbell lo confirme
    asesora: "Sandra Zapata",
    redes: []                          // ej. { nombre: "Instagram", url: "https://instagram.com/..." }
  },

  /* Agenda ILUSTRATIVA para la primera versión.
     Ajustar a los horarios reales del centro. */
  agenda: {
    diasLaborables: [1, 2, 3, 4, 5, 6],   // 0 = domingo … 6 = sábado
    horarios: ["09:00", "10:00", "11:30", "13:00", "14:00", "15:30", "16:30", "17:30"],
    diasMaximosAnticipacion: 60
  },

  /* Métodos de pago: activar solo los que Isbell apruebe. */
  pagos: [
    { id: "establecimiento", nombre: "Pago en el establecimiento", detalle: "Pagas el día de tu cita, en el centro.", activo: true },
    { id: "anticipado", nombre: "Pago anticipado en línea", detalle: "Disponible próximamente mediante pasarela segura.", activo: false },
    { id: "abono", nombre: "Abono para reservar", detalle: "Sujeto a la política que establezca Isbell.", activo: false }
  ],

  categorias: [
    {
      id: "facial",
      nombre: "Cuidado facial",
      corto: "Tratamientos para el cuidado y la apariencia de la piel del rostro.",
      intro: "Tratamientos enfocados en el bienestar y la apariencia de la piel del rostro. Algunos procedimientos requieren una valoración profesional previa para determinar si son adecuados para ti.",
      guia: "Si buscas relajación y tonificación, el yoga facial es un buen punto de partida. Si tienes una necesidad específica de la piel, como manchas o falta de hidratación, te recomendamos solicitar una valoración para recibir orientación personalizada.",
      imagen: "img/facial.jpg",
      icono: "face"
    },
    {
      id: "masajes",
      nombre: "Masajes y relajación",
      corto: "Momentos de descanso para liberar la tensión del cuerpo y la mente.",
      intro: "Servicios pensados para que desconectes, alivies la tensión y disfrutes de una sensación de descanso y bienestar.",
      guia: "Si dispones de una hora, el masaje relajante ofrece una experiencia completa. Si tienes poco tiempo, el sillón de masajes es una pausa rápida de 30 minutos.",
      imagen: "img/masaje.jpg",
      icono: "spa"
    },
    {
      id: "experiencias",
      nombre: "Experiencias de bienestar",
      corto: "Combinaciones de tratamientos faciales y corporales en una sola visita.",
      intro: "Experiencias que reúnen varios tratamientos faciales y corporales para que disfrutes de un momento completo de autocuidado.",
      guia: "Las experiencias son ideales para regalarte una pausa después del trabajo o para celebrar un momento especial.",
      imagen: "img/hero-spa.jpg",
      icono: "sparkle"
    },
    {
      id: "nutricion",
      nombre: "Atención nutricional",
      corto: "Orientación alimentaria y recomendaciones personalizadas.",
      intro: "Atención profesional orientada a brindarte recomendaciones de alimentación y hábitos saludables de forma personalizada.",
      guia: "La primera consulta permite conocer tus hábitos y objetivos para orientar las recomendaciones.",
      imagen: null,
      icono: "leaf"
    }
  ],

  servicios: [
    {
      id: "yoga-facial",
      nombre: "Yoga facial",
      categoria: "facial",
      precio: 45,
      duracion: 60,
      destacado: true,
      imagenes: [],
      icono: "face",
      corto: "Ejercicios y respiración para tonificar y relajar el rostro.",
      descripcion: "Técnica que combina ejercicios específicos, movimientos faciales y técnicas de respiración para trabajar los músculos del rostro, favorecer la circulación y promover la relajación.",
      consiste: "Durante la sesión se guían ejercicios y movimientos faciales acompañados de técnicas de respiración. El trabajo se realiza de forma suave y progresiva, adaptado a cada persona.",
      beneficios: ["Tonificación de los músculos faciales.", "Mejora de la circulación.", "Disminución de la tensión facial.", "Relajación y reducción del estrés."],
      preparacion: "Acude con el rostro limpio y sin maquillaje, si es posible.",
      posterior: "Mantén una buena hidratación. Puedes repetir en casa los ejercicios recomendados.",
      valoracion: false,
      palabras: "rostro cara facial relajacion ejercicios tonificar"
    },
    {
      id: "masaje-relajante",
      nombre: "Masaje relajante",
      categoria: "masajes",
      precio: 35,
      duracion: 60,
      destacado: true,
      imagenes: ["img/masaje.jpg"],
      icono: "spa",
      corto: "Experiencia de relajación corporal con aromaterapia.",
      descripcion: "Tratamiento corporal que utiliza movimientos suaves y fluidos para favorecer la relajación física y mental. Puede incorporar aromaterapia, gua sha facial y velo de colágeno, según el servicio ofrecido.",
      consiste: "A través de maniobras suaves y fluidas se trabaja el cuerpo para disolver la tensión muscular, acompañado de aromaterapia, gua sha facial y velo de colágeno.",
      beneficios: ["Reducción del estrés.", "Alivio de la tensión muscular.", "Sensación de descanso y bienestar.", "Favorece la relajación."],
      preparacion: "Evita comidas abundantes una hora antes. Infórmanos si tienes alguna lesión o condición de salud.",
      posterior: "Bebe agua y procura un momento de descanso después de la sesión.",
      valoracion: false,
      palabras: "masaje cuerpo relajacion aromaterapia gua sha colageno estres espalda"
    },
    {
      id: "sillon-masajes",
      nombre: "Sillón de masajes",
      categoria: "masajes",
      precio: 15,
      duracion: 30,
      destacado: true,
      imagenes: [],
      icono: "chair",
      corto: "Pausa rápida de relajación con programas e intensidades.",
      descripcion: "Servicio de relajación mediante un sillón especializado que ofrece diferentes programas e intensidades de masaje.",
      consiste: "Te acomodas en el sillón especializado y seleccionamos contigo el programa y la intensidad más cómodos para ti.",
      beneficios: ["Relajación muscular.", "Disminución de la sensación de estrés.", "Sensación de descanso.", "Experiencia cómoda de relajación."],
      preparacion: "Usa ropa cómoda.",
      posterior: "Puedes continuar con tus actividades con normalidad.",
      valoracion: false,
      palabras: "sillon silla masaje rapido relajacion"
    },
    {
      id: "after-office",
      nombre: "Experiencia After Office",
      categoria: "experiencias",
      precio: 55,
      duracion: null,
      destacado: true,
      imagenes: ["img/hero-spa.jpg"],
      icono: "sparkle",
      corto: "Limpieza facial, mascarilla y masaje en una sola experiencia.",
      descripcion: "Experiencia de bienestar que combina diferentes tratamientos faciales y corporales, especialmente diseñada para disfrutar de un momento de relajación y autocuidado.",
      consiste: "Una experiencia completa que reúne cuidado facial y corporal en una misma visita.",
      incluye: ["Limpieza facial profunda.", "Mascarilla hidroplástica.", "Masaje de espalda, cuello y cabeza.", "Aromaterapia."],
      beneficios: ["Momento completo de relajación y autocuidado.", "Cuidado facial y corporal en una sola visita.", "Sensación de descanso al final del día."],
      preparacion: "Acude con el rostro sin maquillaje, si es posible.",
      posterior: "Bebe agua y evita la exposición solar intensa ese día.",
      valoracion: false,
      palabras: "experiencia after office limpieza facial mascarilla masaje aromaterapia paquete combo"
    },
    {
      id: "melasma",
      nombre: "Tratamiento de melasma",
      categoria: "facial",
      precio: null,
      duracion: null,
      destacado: false,
      imagenes: [],
      icono: "sun",
      corto: "Cuidado personalizado para la apariencia de manchas en la piel.",
      descripcion: "Tratamiento estético personalizado enfocado en mejorar la apariencia de las manchas oscuras de la piel, especialmente las relacionadas con el melasma.",
      consiste: "Se inicia con una valoración de la piel para definir un plan personalizado. El número de sesiones y su duración se establecen según cada caso.",
      beneficios: ["Mejora de la apariencia de las manchas.", "Mayor uniformidad visual del tono de piel.", "Cuidado personalizado de la piel."],
      nota: "Los resultados dependen de las características individuales de cada paciente.",
      preparacion: "Se definirá durante la valoración profesional.",
      posterior: "Uso de protector solar y recomendaciones indicadas por el profesional.",
      valoracion: true,
      palabras: "melasma manchas piel tono despigmentacion facial"
    },
    {
      id: "mesoterapia-facial",
      nombre: "Mesoterapia facial",
      categoria: "facial",
      precio: null,
      duracion: null,
      destacado: false,
      imagenes: ["img/facial.jpg"],
      icono: "drop",
      corto: "Procedimiento especializado para la hidratación de la piel.",
      descripcion: "Procedimiento estético especializado orientado al cuidado de la piel, que puede utilizar productos específicos para mejorar su hidratación y apariencia.",
      consiste: "Procedimiento realizado por personal profesional, previa valoración, con productos seleccionados según las necesidades de la piel.",
      beneficios: ["Cuidado especializado de la piel.", "Apoyo a la hidratación.", "Atención según valoración profesional."],
      nota: "Requiere valoración profesional previa para determinar su idoneidad.",
      preparacion: "Se definirá durante la valoración profesional.",
      posterior: "Seguir las recomendaciones indicadas por el profesional.",
      valoracion: true,
      palabras: "mesoterapia facial hidratacion piel"
    },
    {
      id: "atencion-nutricional",
      nombre: "Atención nutricional",
      categoria: "nutricion",
      precio: null,
      duracion: null,
      destacado: false,
      imagenes: [],
      icono: "leaf",
      corto: "Orientación alimentaria y recomendaciones personalizadas.",
      descripcion: "Servicio de atención profesional enfocado en brindar orientación alimentaria y recomendaciones nutricionales personalizadas.",
      consiste: "Consulta profesional para conocer tus hábitos y objetivos y brindarte orientación alimentaria.",
      incluye: ["Evaluación nutricional.", "Orientación sobre hábitos alimenticios.", "Recomendaciones de alimentación.", "Seguimiento nutricional, según disponibilidad."],
      beneficios: ["Orientación personalizada.", "Recomendaciones adaptadas a tus hábitos.", "Acompañamiento según disponibilidad."],
      preparacion: "Si los tienes, trae exámenes o información relevante sobre tu alimentación.",
      posterior: "Seguimiento según disponibilidad.",
      valoracion: false,
      palabras: "nutricion alimentacion dieta habitos nutricionista"
    }
  ]
};
