const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Coloque seus tokens diretamente no código (mais simples)
const VERIFY_TOKEN = 'meu_verify_token';
const PAGE_ACCESS_TOKEN = 'EAAO7DxyrBvsBOy5mwEc4yGRpdXjf1uZA3RRcOoqldSJsIZAulZBgnUJB7dHRtSK8bynbZAHXofeMUyZBoBgZAUsZAfCYrwqUmjBa5XCCHoNjcv8z9d75tc44OVsTbWKQCn9GPtxOvRJqnQgqtshKgwIjwk9ZAaitXjEtAPwYQKFhRtafQi77Kh21xQNdoxVA2YNyLu1oEbM4qUIZD';

// Verificar o Webhook (necessário para o Facebook)
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

// Receber eventos de mensagens
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhookEvent = entry.messaging[0];
            let senderId = webhookEvent.sender.id;

            sendMessageWithButtons(senderId);
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Função para enviar mensagem com botões
function sendMessageWithButtons(senderId) {
    let messageData = {
        recipient: { id: senderId },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Confira as delícias da Coxinha Gourmet & Hamburgueria na nossa loja virtual ou fale conosco pelo WhatsApp. Estamos aqui para ajudar!:",
                    buttons: [
                        {
                            type: "web_url",
                            url: "https://bit.ly/lojacoxinhagourmet",
                            title: "Visite a Loja"
                        },
                        {
                            type: "web_url",
                            url: "https://wa.me/5574981150370",
                            title: "Fale no WhatsApp"
                        }
                    ]
                }
            }
        }
    };

    axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Mensagem enviada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao enviar a mensagem:', error);
        });
}

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
