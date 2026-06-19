## Cambios

### 1. Home (`src/routes/index.tsx`)
- Eliminar la sección **"Sueños recientes"** completa: el `<Section label="Sueños recientes">`, el componente `RecentDreams`, el helper `ProgressBar`, los imports de `getDreams`, `Star`, `useEffect`, `useState` que ya no se usan, y los assets relacionados.
- El resto de la home queda igual (header, widget "Están soñando con vos", monitoreo, menciones, decodificador).

### 2. Sleep BOT con historial (`src/routes/sueno.chat.tsx`)
Convertir el chat en una experiencia con historial persistente de conversaciones/sueños registrados:

- **Persistencia de mensajes**: guardar el hilo de chat en `localStorage` (clave `sleep-bot-history`) usando un nuevo helper `src/lib/sleepbot-history.ts` con tipos `ChatTurn` y funciones `getHistory / appendTurn / clearHistory`.
- Cada vez que se envía un sueño y la IA responde, se persiste el par usuario+asistente (además de seguir guardando el sueño interpretado en `dreams-store` como hoy).
- Al montar el chat, se hidratan los mensajes desde `localStorage` para que el usuario vea su conversación previa.

- **Panel de historial dentro del chat**:
  - Botón "Historial" en el header del chat que abre un `Sheet` lateral.
  - Lista los sueños registrados (desde `getDreams()`): miniatura, título, fecha, y al tocar uno → navega a `/sueno/$id` (detalle ya existente).
  - Botón "Limpiar conversación" que borra solo el hilo de chat (no los sueños guardados), con confirmación.

- **Estado vacío mejorado**: si no hay historial ni sueños guardados, muestra la tarjeta actual "Contame tu sueño". Si hay sueños previos pero no hay chat activo, muestra un mini-resumen "Último sueño registrado: …" con link al detalle.

### Archivos

- editar `src/routes/index.tsx` — remover sección.
- crear `src/lib/sleepbot-history.ts` — persistencia del hilo.
- editar `src/routes/sueno.chat.tsx` — hidratar/persistir mensajes, agregar Sheet de historial, botón limpiar.

### Detalles técnicos
- Sin cambios de backend; todo localStorage.
- Reutiliza shadcn `Sheet` ya disponible.
- Mantiene la lógica actual de `interpretDream` y `saveDream`.

### Preguntas opcionales
¿El historial debe agruparse por sesiones/días o un único hilo continuo? Por defecto haré **un único hilo continuo** (más simple y similar a ChatGPT). Avisame si preferís separarlo por días.