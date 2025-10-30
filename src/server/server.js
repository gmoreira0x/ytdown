const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4001;

app.use(cors());
app.use(express.json());

function isValidYouTubeUrl(url) {
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return ytRegex.test(url);
}

app.post('/download', (req, res) => {
  const { url, format } = req.body;

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'URL do YouTube inválida.' });
  }

  const ext = format === 'mp3' ? 'mp3' : 'mp4';

  exec(`yt-dlp --get-title ${url}`, (titleErr, stdout) => {
    if (titleErr || !stdout.trim()) {
      console.error('Erro ao obter título:', titleErr);
      return res.status(500).json({ error: 'Erro ao obter título do vídeo.' });
    }

    const rawTitle = stdout.trim();
    const safeTitle = rawTitle
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 80)
      .trim();

    const filename = `${safeTitle}.${ext}`;
    const filePath = path.join(__dirname, filename);

    let command;
    if (format === 'mp3') {
      command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${filePath}" ${url}`;
    } else {
      command = `yt-dlp -f "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/best" --merge-output-format mp4 -o "${filePath}" ${url}`;
    }

    exec(command, (downloadErr) => {
      if (downloadErr) {
        console.error(`Erro ao baixar ${format}:`, downloadErr);
        return res.status(500).json({ error: `Erro ao baixar o ${format}.` });
      }

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Arquivo não encontrado após o download.' });
        }

        const host = req.hostname;
        const downloadUrl = `http://${host}:${port}/downloads/${encodeURIComponent(filename)}`;

        res.status(200).json({
          message: 'Download pronto.',
          downloadUrl,
          filename,
        });
      });
    });
  });
});


app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado.');
  }

  res.download(filePath, filename); 
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
