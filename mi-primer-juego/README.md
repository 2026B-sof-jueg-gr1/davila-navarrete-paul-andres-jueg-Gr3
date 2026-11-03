# Risas Macabras

Puzzle en Phaser 3 inspirado en la mecánica de los "killer puzzles": el payaso Bufo se desliza
en línea recta hasta chocar con algo, y si choca con una víctima, la elimina.

## Reglas
- Hay 5 niveles de dificultad creciente (de 3 a 5 víctimas).
- Elimina a todas las víctimas sin pasarte del límite de movimientos (el mínimo + 2); si se acaban, el nivel se reinicia.
- Luego aparece la última víctima: tienes pocos movimientos para alcanzarla (se indica en pantalla).
- Al alcanzarla, detén la aguja en la zona verde 3 veces seguidas.
- Si escapa, el nivel cuenta como superado, pero con menos puntos.

## Controles
Flechas o WASD para moverte, Z para deshacer, R para reiniciar, Esc para volver al menú.
En pantallas táctiles: desliza para moverte y toca para golpear.

## Ejecutar
Abre `index.html` con Live Server (VS Code). Requiere internet para cargar Phaser y las fuentes.

## Estructura
- `js/config.js`: constantes, nivel y dificultad
- `js/textures.js`: gráficos dibujados por código
- `js/sfx.js`: sonidos sintetizados con Web Audio
- `js/scenes/`: menú, opciones, ayuda, juego y resultados
