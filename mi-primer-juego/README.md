# Risas Macabras

Puzzle en Phaser 3 inspirado en la mecánica de los "killer puzzles": el payaso Bufo se desliza
en línea recta hasta chocar con algo, y si choca con una víctima, la elimina.

## Reglas
- Elimina a las 3 víctimas para superar el nivel.
- Luego aparece la última víctima: tienes 4 movimientos para alcanzarla.
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
