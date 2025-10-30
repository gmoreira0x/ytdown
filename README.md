Servidor de Download de Vídeos
Este é um servidor backend simples, feito em Node.js e Express, que utiliza o yt-dlp para baixar vídeos ou áudios (MP3/MP4) do YouTube.

🚀 Pré-requisitos
Para que este servidor funcione, você precisará ter as seguintes ferramentas instaladas em sua máquina:

Node.js: Essencial para rodar o servidor.

yt-dlp: A ferramenta principal que baixa os vídeos.

ffmpeg: Ferramenta essencial que o yt-dlp usa para converter arquivos para MP3 e mesclar áudio e vídeo em arquivos MP4.

⚙️ Guia de Instalação (Windows)
Este guia utiliza o gerenciador de pacotes Chocolatey para instalar as dependências do sistema (yt-dlp e ffmpeg) de forma fácil e rápida.

Passo 1: Instalar o Chocolatey ("Choco")
Se você ainda não o tem, instale o Chocolatey primeiro:

Clique no Menu Iniciar, digite "PowerShell".

Clique com o botão direito em "Windows PowerShell" e selecione "Executar como administrador".

Copie e cole o comando abaixo no PowerShell e pressione Enter:

PowerShell

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
Aguarde a instalação terminar.

Importante: Feche e reabra o PowerShell (como administrador) para garantir que o comando choco seja reconhecido.

Passo 2: Instalar o yt-dlp e o FFmpeg
Com o Chocolatey pronto, execute o comando a seguir no seu PowerShell (Admin):

Bash

choco install yt-dlp ffmpeg -y
Isso instalará tanto o yt-dlp (o downloader) quanto o ffmpeg (o conversor).

Passo 3: Configurar o Projeto Node.js
Clone ou baixe este repositório.

Abra um terminal (CMD, PowerShell ou Git Bash) na pasta do projeto.

Instale as dependências do Node.js (Express, CORS, etc.):

Bash

npm install
🏁 Executando o Projeto
Com tudo instalado, você tem duas maneiras de iniciar:

Modo Simples (Windows)
Importante: Edite o arquivo primeiro! Antes de executar o start.bat pela primeira vez, clique com o botão direito sobre ele e escolha "Editar".

Você deve atualizar os caminhos (ex: cd C:\Users\SeuUsuario\Projetos\...) dentro do arquivo para que apontem para os locais exatos onde você salvou as pastas do backend e do frontend no seu computador.

Salve o arquivo após a edição.

Após editar os caminhos, basta dar um duplo clique no start.bat para iniciar automaticamente o servidor backend e o projeto frontend no mesmo terminal.

⚠️ Solução de Problemas
Erro: 'yt-dlp' não é reconhecido como um comando interno...

Este é o problema mais comum e quase sempre acontece pelo mesmo motivo:

Causa: O terminal que você está usando (CMD, PowerShell ou o terminal integrado do VS Code) foi aberto antes da instalação do Chocolatey/yt-dlp ser concluída. Ele ainda não "sabe" onde encontrar o yt-dlp.

Solução: Reinicie seu terminal.

Se estiver usando o VS Code, feche e reabra o programa completamente.

Se estiver usando um terminal separado (CMD/PowerShell), feche a janela e abra uma nova.