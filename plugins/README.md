# WPWW Plugins

Legg egne integrasjoner i dette området uten å endre WPWW-kjernen.

Hver plugin beskrives av en `plugin.json` og kan ha egen kode, Dockerfile og tester.

## Struktur

```text
plugins/
  my-plugin/
    plugin.json
    README.md
    Dockerfile
    src/
    tests/
```

## Minimum `plugin.json`

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "category": "tool",
  "enabledByDefault": false,
  "targetPolicy": "closed-lab-only",
  "entrypoint": "src/main.py",
  "healthcheck": true,
  "reportAdapter": true
}
```

Plugins are opt-in and must declare that they operate only against the closed WPWW laboratory. External targets are not accepted by the plugin registry.
