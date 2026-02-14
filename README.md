# Chocho Runner

Juego arcade simple hecho en HTML, CSS y JavaScript puro.

## Ejecutar (rápido)

```bash
./run_game.sh
```

Luego abre `http://localhost:8000`.

Si quieres otro puerto:

```bash
./run_game.sh 9000
```

`run_game.sh` intenta este orden para evitar errores de "not found":

1. `python3`
2. `python`
3. `busybox httpd`
4. `node` (servidor estático integrado, sin dependencias)

## Ejecutar manualmente

Abre `index.html` directamente o levanta un servidor estático:

```bash
python3 -m http.server 8000
```

## Controles

- `←` / `A`: mover a la izquierda
- `→` / `D`: mover a la derecha
- `R`: reiniciar
