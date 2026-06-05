#!/bin/bash
# 🚀 github-create — Crea un repo en GitHub y sube el proyecto actual
# Uso: github-create <nombre-del-repo> [descripción]

set -e

REPO_NAME="$1"
DESCRIPTION="${2:-Subido desde Clever en Raspberry Pi}"
GITHUB_USER="Pablovelazquezb"

if [ -z "$REPO_NAME" ]; then
    echo "❌ Uso: github-create <nombre-del-repo> [descripción]"
    exit 1
fi

# Crear repo en GitHub
echo "🚀 Creando repositorio $GITHUB_USER/$REPO_NAME..."
curl -sf -X POST https://api.github.com/user/repos \
  -H "Authorization: token $(grep GITHUB_TOKEN /home/pablo/.openclaw/workspace/trading_bot/.env | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"$DESCRIPTION\",\"private\":false}" > /dev/null && echo "✅ Repositorio creado"

# Si hay un git init, configurar remote
if [ -d .git ]; then
    git remote add origin "git@github.com:$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
    git remote set-url origin "git@github.com:$GITHUB_USER/$REPO_NAME.git"
    git push -u origin main 2>&1 || git push -u origin master 2>&1
    echo "✅ Código subido a https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo "⚠️  No hay repo git. Inicialízalo con: git init && git add -A && git commit -m 'first'"
fi
