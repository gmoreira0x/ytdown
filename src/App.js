import React, { useState } from 'react';
import './App.css';

function App() {
  /* Gerencia o estado do componente:
   * url: O link do YouTube digitado pelo usuário.
   * error: Mensagem de erro para o usuário.
   * loadingButton: Qual botão está processando ('mp3', 'mp4' ou '').
   * successMsg: Mensagem de sucesso.
   */
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingButton, setLoadingButton] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* Função principal chamada pelos botões para iniciar o download */
  const handleDownload = async (format) => {
    /* 1. Validação básica: verifica se a URL não está vazia */
    if (!url.trim()) {
      setError('Por favor, insira uma URL válida.');
      return;
    }

    /* 2. Reseta o estado da UI e ativa o "loading" do botão clicado */
    setError('');
    setSuccessMsg('');
    setLoadingButton(format);

    try {
      /* Pega o host atual (ex: 'localhost') para montar a URL da API */
      const host = window.location.hostname;

      /* 3. Chama a API backend (na porta 4001) com a URL e o formato */
      const response = await fetch(`http://${host}:4001/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format }),
      });

      /* 4. Trata erros caso a resposta do servidor não seja 'OK' (ex: 404, 500) */
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido no servidor.');
      }

      /* 5. Pega a URL de download (ex: /downloads/video.mp4) vinda do backend */
      const { downloadUrl } = await response.json();

      /* 6. "Truque" para forçar o download no navegador:
       * Cria um link invisível, clica nele e depois o remove.
       */
      const link = document.createElement('a');
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg(`${format === 'mp3' ? 'Áudio' : 'Vídeo'} pronto para download.`);
    
    } catch (err) {
      /* Captura erros de rede ou os erros lançados no 'if (!response.ok)' */
      setError(err.message || `Erro ao baixar o ${format}.`);
    
    } finally {
      /* 7. Independentemente de sucesso ou erro, limpa o estado de loading */
      setLoadingButton('');
    }
  };

  /* Renderização do componente (o que aparece na tela) */
  return (
    <div className="App">
      <h1>Downloader</h1>

      {/* Input para a URL. Fica desabilitado durante o loading. */}
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Cole o link do YouTube"
        className="url-input"
        disabled={loadingButton !== ''}
      />

      <div className="button-group">
        {/* Botão de MP3. Muda o texto e fica desabilitado durante o loading. */}
        <button
          onClick={() => handleDownload('mp3')}
          disabled={loadingButton !== '' || !url.trim()}
        >
          {loadingButton === 'mp3' ? 'Processando...' : 'Baixar MP3'}
        </button>

        {/* Botão de MP4. */}
        <button
          onClick={() => handleDownload('mp4')}
          disabled={loadingButton !== '' || !url.trim()}
        >
          {loadingButton === 'mp4' ? 'Processando...' : 'Baixar MP4'}
        </button>
      </div>

      {/* Renderização condicional das mensagens de erro ou sucesso */}
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
    </div>
  );
}

export default App;
