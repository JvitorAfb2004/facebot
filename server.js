const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

// Carregar certificados SSL
const options = {
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem')
};

// Substitua pelos seus tokens diretamente aqui
const VERIFY_TOKEN = 'geniussolucoes';
const PAGE_ACCESS_TOKEN = 'EAAO7DxyrBvsBOy5mwEc4yGRpdXjf1uZA3RRcOoqldSJsIZAulZBgnUJB7dHRtSK8bynbZAHXofeMUyZBoBgZAUsZAfCYrwqUmjBa5XCCHoNjcv8z9d75tc44OVsTbWKQCn9GPtxOvRJqnQgqtshKgwIjwk9ZAaitXjEtAPwYQKFhRtafQi77Kh21xQNdoxVA2YNyLu1oEbM4qUIZD';

const app = express();
app.use(bodyParser.json());

// Verificar Webhook (Facebook exige verificação)
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receber eventos
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhookEvent = entry.messaging[0];
            let senderId = webhookEvent.sender.id;

            // Enviar mensagem de redirecionamento para o WhatsApp
            sendWhatsAppRedirect(senderId);
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Função para enviar resposta automática
function sendWhatsAppRedirect(senderId) {
    const messageData = {
        messaging_type: 'RESPONSE',
        recipient: {
            id: senderId
        },
        message: {
            text: 'Olá! Para continuar, por favor, entre em contato conosco pelo WhatsApp: https://wa.me/5574981150370'
        }
    };

    axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Mensagem enviada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao enviar a mensagem: ', error);
        });
}

// Iniciar o servidor HTTPS
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`Servidor rodando em HTTPS na porta ${PORT}`);
});
