# Spider-Verse Developer

Sitio personal interactivo de Joan Vila Orus hecho con Three.js, Vite y JavaScript modular. La idea es simple: una ciudad procedural como escenario, una capa de interfaz personal y varias interacciones que presentan el proyecto sin convertir la página en un muro de texto.

## Cómo funciona

- `src/main.js` arranca la app, comprueba WebGL, carga la escena y conecta la UI.
- `src/scene/` construye la ciudad, las luces y las partículas sin depender de modelos pesados.
- `src/interactions/` gestiona la cámara, el teclado, el Spider-Sense y los disparos de telaraña.
- `src/ui/` muestra el loader, las notificaciones, el panel de perfil y el selector de calidad.
- `src/utils/` agrupa el rendimiento, el redimensionado, la limpieza de objetos y el sonido.

## Datos personales

- GitHub: https://github.com/vilavilla/spider-verse-developer
- Personal site: https://vilavilla.github.io/
- Email: joanvilaa4@gmail.com

## Uso

Requisitos: Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

Comandos útiles:

```bash
npm run build
npm run preview
npm test
```

## Controles

- Click o tap: lanzar una telaraña.
- `W`: telaraña aleatoria.
- `S`: activar o desactivar Spider-Sense.
- `O`: orbitación automática.
- `R`: restaurar la cámara.
- `Esc`: cerrar paneles y efectos.

## Nota técnica

El proyecto está pensado para funcionar bien en GitHub Pages y en navegadores modernos con WebGL. Si más adelante quieres añadir capturas, assets o datos extra, basta con ampliar `public/` y el panel de perfil.
