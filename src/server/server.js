/* Importações principais:
 * express: O framework do servidor web.
 * cors: Permite que o frontend (em outra porta, ex: 3000) acesse esta API (na porta 4001).
 * exec: Função do Node para executar comandos de terminal (como o yt-dlp).
 * fs: (File System) Para interagir com arquivos (verificar se existem, etc.).
 * path: Para montar caminhos de arquivos de forma segura (funciona em Windows, Mac, Linux).
 */
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4001;

/* Configuração do Servidor:
 * app.use(cors()): Permite requisições de origens diferentes (ex: localhost:3000).
 * app.use(express.json()): Permite que o servidor entenda JSON enviado no corpo (body) das requisições POST.
 */
app.use(cors());
app.use(express.json());

/* Função helper para validar a URL do YouTube usando Regex (Expressão Regular). */
function isValidYouTubeUrl(url) {
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return ytRegex.test(url);
}

/* Rota principal [POST /download]
 * É aqui que o frontend bate para *iniciar* o processo de download.
 */
app.post('/download', (req, res) => {
  /* 1. Pega a URL e o formato (mp3/mp4) enviados pelo frontend. */
  const { url, format } = req.body;

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'URL do YouTube inválida.' });
  }

  const ext = format === 'mp3' ? 'mp3' : 'mp4';

  /* 2. [ETAPA 1 do yt-dlp] Pega o TÍTULO do vídeo.
   * Isso é feito separadamente para criar um nome de arquivo "limpo" e amigável.
   */
  exec(`yt-dlp --get-title ${url}`, (titleErr, stdout) => {
    if (titleErr || !stdout.trim()) {
      console.error('Erro ao obter título:', titleErr);
      return res.status(500).json({ error: 'Erro ao obter título do vídeo.' });
    }

    /* 3. Limpa o título para ser um nome de arquivo seguro.
     * Remove caracteres inválidos (como / \ : * ?) e limita o tamanho.
     */
    const rawTitle = stdout.trim();
    const safeTitle = rawTitle
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove caracteres ilegais em nomes de arquivo
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um
      .substring(0, 80) // Limita o comprimento
      .trim();

    const filename = `${safeTitle}.${ext}`;
    const filePath = path.join(__dirname, filename); // Caminho completo (ex: C:\projeto\video.mp4)

    /* 4. Monta o comando de download específico (MP3 ou MP4). */
    let command;
    if (format === 'mp3') {
      /* -x --audio-format mp3: Extrai o áudio e converte para MP3. */
      command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${filePath}" ${url}`;
    } else {
      /* -f "best...": Pega o melhor vídeo (vcodec avc1) + melhor áudio (acodec mp4a) e junta. */
      command = `yt-dlp -f "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/best" --merge-output-format mp4 -o "${filePath}" ${url}`;
    }

    /* 5. [ETAPA 2 do yt-dlp] Executa o DOWNLOAD real.
     * Isso pode demorar vários segundos ou minutos.
     */
    exec(command, (downloadErr) => {
      if (downloadErr) {
        console.error(`Erro ao baixar ${format}:`, downloadErr);
        return res.status(500).json({ error: `Erro ao baixar o ${format}.` });
      }

      /* 6. Verifica se o arquivo foi realmente criado no disco. */
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Arquivo não encontrado após o download.' });
        }

        /* 7. SUCESSO!
         * Cria a URL que o frontend usará para *realmente* baixar o arquivo.
         * (Ex: http://localhost:4001/downloads/video-limpo.mp4)
         */
        const host = req.hostname;
        const downloadUrl = `http://${host}:${port}/downloads/${encodeURIComponent(filename)}`;

        /* Envia a URL de download de volta para o frontend. */
        res.status(200).json({
          message: 'Download pronto.',
          downloadUrl,
          filename,
        });
      });
    });
  });
});


/* Rota secundária [GET /downloads/:filename]
 * É esta rota que o link invisível (<a>) criado no frontend chama.
 * O navegador bate aqui para *pegar* o arquivo que já foi processado.
 */
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);

  /* Verifica se o arquivo (ainda) existe no servidor. */
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado.');
  }

  /* res.download() é a mágica do Express:
   * Ele envia o arquivo para o usuário e define os cabeçalhos corretos
   * para forçar o navegador a "Baixar" em vez de "Abrir".
   */
  res.download(filePath, filename);
});

/* Inicia o servidor e fica "ouvindo" por requisições na porta 4001. */
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
