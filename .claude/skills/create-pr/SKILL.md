---
name: create-pr
description: Erstelle einen PR für den aktuellen Branch mit allen Checks.
disable-model-invocation: true
---

Erstelle einen Pull Request für den aktuellen Branch:

1. Prüfe den Branch-Status:
   - `git diff main --stat` — geänderte Dateien
   - `git log main..HEAD --oneline` — Commits

2. Führe alle Checks aus:
   - `npm run typecheck`
   - `npx next lint`
   - `npm run test`
   - `npm run build`
   Falls ein Check fehlschlägt → fixe das Problem zuerst.

3. Bestimme die Issue-Nummer aus dem Branch-Namen (Format: type/NUMMER-description)

4. Erstelle den PR:
   ```
   gh pr create --title "type(scope): description (#NUMMER)" --body "$(cat <<'EOF'
   ## Was

   [Zusammenfassung der Änderungen]

   Closes #NUMMER

   ## Checkliste

   - [x] Build sauber
   - [x] Tests grün
   - [x] TypeCheck OK
   - [x] Lint OK
   EOF
   )"
   ```

5. Gib die PR-URL aus
