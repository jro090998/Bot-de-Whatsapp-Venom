const express = require('express');
const venom = require('venom-bot');
const QRCode = require('qrcode');
const base64js = require('base64-js');
const path = require('path')

const app = express();
const port = 3000;
const pastaArquivos = 'files/'
app.use(express.json());

let client;
let statusMessage = "";
let sessionFailed = false;
let firstLoad = true;

// Inicia a sessão do WhatsApp
venom.create({
  catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
    base64img = base64Qrimg
  },
})
.then((clientInstance) => {
  console.log('Sessão iniciada com sucesso!');
  statusMessage = " ✅Sessão iniciada com sucesso! Aguarde o Envio das Mensagens em seu Whatsapp...";
  client = clientInstance;
})
.catch((error) => {
  console.log('Erro ao iniciar sessão: ', error);
  statusMessage = " ❌Erro ao iniciar sessão. Tente novamente o processo.";
  sessionFailed = true;
});



// API para verificar se a sessão do WhatsApp está ativa
app.get('/api/statusVenom', (req, res) => {
  if (!client) {
    res.status(500).send(false);
  } else {
    res.send(true);
  }
});

//api para captar grupo id pelo nome

app.get('/api/grupoID', async (req, res) => {
  const {
    nomeGrupo
  } = req.query

  if (!nomeGrupo) {
    res.status(400).send('nome de grupo não encontrado');
    return
  }

  if (!client) {
    res.status(400).send('client não iniciado');
    return
  }
  const chats = await client.getAllChatsGroups();
  const retorno = chats.find(chat => chat.name.toLowerCase().includes(nomeGrupo.toLowerCase()))
  res.json(retorno.id._serialized);
});

// API para gerar URL do QR code

app.get("/api/qrcode", async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  let pageContent = "<html><head><style>";
  pageContent += "body { font-family: 'Poppins', sans-serif; font-size: 24px; display: flex; justify-content: center; align-items: center; height: 100vh; }";
  pageContent += ".status-message { text-align: center; }";
  pageContent += ".qr-code-container { display: flex; flex-direction: column; align-items: center; gap: 1rem; }";
  pageContent += "</style></head><body>";
  if (!sessionFailed && !statusMessage) {
    pageContent += "<div class='qr-code-container'>";
    pageContent += "<div>Escaneie o QR Code abaixo e aguarde a resposta da sessão...</div>";
    pageContent += "<div class='gap-div'></div>"; 
    pageContent += "<img src='" + base64img + "'>";
    pageContent += "</div>";
  } else {
    pageContent += "<div class='status-message'>" + (sessionFailed ? "Erro ao iniciar sessão. Tente novamente mais tarde." : statusMessage) + "</div>";
  }
  pageContent += "<script>setInterval(function(){ location.reload(); }, 10000);</script>";
  pageContent += "</body></html>";
  res.end(pageContent);
});


// API para enviar imagem
app.post('/api/send-image', (req, res) => {
  const to = req.body.to;
  const image = req.body.image;
  const caption = req.body.caption;
  const nomeImagem = pastaArquivos + req.body.nomeImagem;

  if (!client) {
    console.error('Sessão não iniciada!');
    res.status(400).send('Sessão não iniciada!');
    return;
  }

  if (typeof caption !== 'string') {
    console.error('Legenda inválida!');
    res.status(400).send('Legenda inválida!');
    return;
  }

  client.sendImage(to, image, nomeImagem, caption)
    .then((result) => {
      console.log('Imagem enviada com sucesso!', result);
      res.send('Imagem enviada com sucesso!');
    })
    .catch((error) => {
      console.error('Erro ao enviar imagem:', error);
      res.status(500).send('Erro ao enviar imagem!');
    });
});

app.listen(3000)

