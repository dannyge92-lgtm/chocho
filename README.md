# Chocho Runner

Juego arcade simple hecho en HTML, CSS y JavaScript puro.

## ¿Se puede ver con "Preview"?

Sí, pero depende de dónde lo abras:

- En **VS Code / Cursor** puedes abrir `index.html` y usar **Open Preview** o una extensión tipo **Live Server**.
- En esta terminal/repo no hay un botón web público automático: debes levantarlo localmente en tu PC y abrir una URL en tu navegador.

## Montarlo en tu PC (rápido)

Desde la carpeta del proyecto:

```bash
./run_game.sh
```

Luego abre en tu navegador:

- `http://localhost:8000`

Si quieres otro puerto:

```bash
./run_game.sh 9000
```

## Si `./run_game.sh` da error

Puedes arrancarlo manualmente con Python:

```bash
python3 -m http.server 8000
```

Y abrir:

- `http://localhost:8000`

`run_game.sh` intenta este orden para evitar errores de "not found":

1. `python3`
2. `python`
3. `busybox httpd`
4. `node` (servidor estático integrado, sin dependencias)

## Controles

- `←` / `A`: mover a la izquierda
- `→` / `D`: mover a la derecha
- `R`: reiniciar
