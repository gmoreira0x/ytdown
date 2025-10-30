import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingButton, setLoadingButton] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDownload = async (format) => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL válida.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoadingButton(format);

    try {
      const host = window.location.hostname;

      const response = await fetch(`http://${host}:4001/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido no servidor.');
      }

      const { downloadUrl } = await response.json();

      const link = document.createElement('a');
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg(`${format === 'mp3' ? 'Áudio' : 'Vídeo'} pronto para download.`);
    } catch (err) {
      setError(err.message || `Erro ao baixar o ${format}.`);
    } finally {
      setLoadingButton('');
    }
  };

  return (
    <div className="App">
      <h1>Downloader</h1>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Cole o link do YouTube"
        className="url-input"
        disabled={loadingButton !== ''}
      />

      <div className="button-group">
        <button
          onClick={() => handleDownload('mp3')}
          disabled={loadingButton !== '' || !url.trim()}
        >
          {loadingButton === 'mp3' ? 'Processando...' : 'Baixar MP3'}
        </button>

        <button
          onClick={() => handleDownload('mp4')}
          disabled={loadingButton !== '' || !url.trim()}
        >
          {loadingButton === 'mp4' ? 'Processando...' : 'Baixar MP4'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
    </div>
  );
}

export default App;
