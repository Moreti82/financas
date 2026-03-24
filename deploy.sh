#!/bin/bash

# Script de deploy para FinançasPro

echo "🚀 Iniciando deploy do FinançasPro..."

# Verificar se está na branch correta
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Você não está na branch main. Mude para a branch main antes de fazer deploy."
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Existem mudanças não commitadas. Faça commit antes de fazer deploy."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Rodar testes
echo "🧪 Rodando testes..."
npm run test

# Verificar tipos
echo "🔍 Verificando tipos TypeScript..."
npm run typecheck

# Lint
echo "✨ Verificando lint..."
npm run lint

# Build
echo "🏗️  Build do projeto..."
npm run build

# Verificar se o build foi bem sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📦 Arquivos gerados em ./dist"
    
    # Se for Vercel
    if command -v vercel &> /dev/null; then
        echo "🚀 Fazendo deploy para Vercel..."
        vercel --prod
    fi
    
    # Se for Netlify
    if command -v netlify &> /dev/null; then
        echo "🚀 Fazendo deploy para Netlify..."
        netlify deploy --prod --dir=dist
    fi
    
    echo "🎉 Deploy concluído com sucesso!"
else
    echo "❌ Falha no build. Corrija os erros antes de fazer deploy."
    exit 1
fi
