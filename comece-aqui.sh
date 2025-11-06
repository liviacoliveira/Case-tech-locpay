#!/bin/bash
set -e

# Protecao contra execucao duplicada
if [ -f "nestjs-template-guia.md" ] || [ -f "express-template-guia.md" ]; then
  echo "O script ja foi executado anteriormente."
  echo "Para executar novamente, restaure os templates originais antes com git restore ."
  exit 1
fi

echo ""
echo " Bem-vindo(a) ao LocPay Tech Challenge"
echo ""
echo "Escolha qual template você deseja usar:"
echo ""
echo "1) NestJS + Prisma + SQLite"
echo "2) ExpressJS + SQLite"
echo ""

read -p "Digite o número da sua escolha [1-2]: " choice
echo ""

case $choice in
  1)
    SELECTED="nestjs-template"
    ;;
  2)
    SELECTED="express-template"
    ;;
  *)
    echo "Opção inválida. Execute novamente e escolha 1 ou 2."
    exit 1
    ;;
esac

echo "  Você escolheu: $SELECTED"
echo ""

# Apaga o template não escolhido
for dir in nestjs-template express-template; do
  if [ "$dir" != "$SELECTED" ]; then
    echo "🧹 Removendo $dir ..."
    rm -rf "$dir"
  fi
done

# Move os arquivos do template escolhido para a raiz
echo "Movendo arquivos de $SELECTED para a raiz..."
mv "$SELECTED"/* .
mv "$SELECTED"/.[^.]* . 2>/dev/null || true
rm -rf "$SELECTED"

MD_SELECTED="$SELECTED-guia.md"

echo ""
echo "Configuração concluída!"
echo "Agora basta seguir as instruções do $MD_SELECTED."
echo ""