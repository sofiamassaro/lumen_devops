#!/usr/bin/env bash
# Prepara uma EC2 Ubuntu nova para receber o deploy. Rode UMA vez, logado
# por SSH, a partir da pasta do projeto clonado:
#   bash deploy/setup-ec2.sh
set -euo pipefail

echo "==> Atualizando pacotes"
sudo apt-get update -y

echo "==> Instalando Docker e o plugin compose"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
# Permite rodar docker sem sudo (o deploy por SSH precisa disso)
sudo usermod -aG docker ubuntu

echo "==> Instalando Nginx"
sudo apt-get install -y nginx

echo "==> Configurando o proxy reverso 80 -> 3000"
sudo cp deploy/nginx-lumen.conf /etc/nginx/sites-available/lumen
sudo ln -sf /etc/nginx/sites-available/lumen /etc/nginx/sites-enabled/lumen
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "==> Criando a pasta da aplicação"
sudo mkdir -p /opt/lumen
sudo chown ubuntu:ubuntu /opt/lumen

echo
echo "Pronto. Saia da sessão SSH (exit) e entre de novo para o grupo docker valer."
echo "Depois disso, o primeiro deploy pode ser disparado pela aba Actions do GitHub."
