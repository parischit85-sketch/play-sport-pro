# GitHub Push Protection - Unblock Secret

## Problema
GitHub ha bloccato il push perché nel commit `338197896708d2aef6974f553ef1bf11c753bb02` c'è un SendGrid API key esposto.

## Soluzione
Visita questo link e sblocca il secret:
https://github.com/parischit85-sketch/play-sport-pro/security/secret-scanning/unblock-secret/35LoklBGDlJMpF9ypLjHgFEVuUk

## Dopo lo sblocco
Esegui:
```bash
git push origin dark-theme-migration
```

## Alternativa (se link non funziona)
1. Vai su: GitHub → Repository Settings → Secret scanning
2. Cerca "SendGrid API Key" nelle secret violations
3. Clicca "Allow" o "Unblock"
4. Ripeti il push
