const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const https = require("https");

const options = {
  key: fs.readFileSync(path.join(__dirname, '../certificado/chave_privada.key')), 
  cert: fs.readFileSync(path.join(__dirname, '../certificado/certificado.crt')),
  ca: fs.readFileSync(path.join(__dirname, '../certificado/CA.crt'))
};

const app = express();
const PORT = 21107;
const ARQUIVO_JSON = path.join(__dirname, 'confirmacoes.json');

app.use(express.urlencoded({ extended: true }));

// --- Middlewares ---
// servidor entender JSON vindo no corpo da requisição
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post('/salvar-confirmacao', async (req, res) => {
    const novaConfirmacao = req.body;
    console.log('Recebida nova confirmação:', novaConfirmacao);
    try {
        let confirmacoes = [];
        try {
            const dadosAtuais = await fs.readFile(ARQUIVO_JSON, 'utf8');
            confirmacoes = JSON.parse(dadosAtuais);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        confirmacoes.push(novaConfirmacao);

        await fs.writeFile(ARQUIVO_JSON, JSON.stringify(confirmacoes, null, 2));

        res.status(200).json({ message: 'Confirmação salva com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar a confirmação:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.get('/lista-confirmacao', async (req, res) => {
    try {
        const dadosConfirmacoesJson = await fs.readFile(ARQUIVO_JSON, 'utf8');
        const confirmacoes = JSON.parse(dadosConfirmacoesJson); 

        let totalConfirmados = 0;
        let totalNaoConfirmados = 0;

        const textoFormatado = confirmacoes.map(confirmacao => {
            const statusConfirmacao = confirmacao.status === 'sim' ? 'confirmado' : 'não confirmado';
            if (statusConfirmacao === 'confirmado') {
                totalConfirmados++;
            } else {
                totalNaoConfirmados++;
            }
            return `${confirmacao.nome} - ${statusConfirmacao}`;
        }).join('\n-------------------------------------------------\n');

        // Cabeçalho com totais
        const cabecalho = `Total confirmados: ${totalConfirmados}\nTotal não confirmados: ${totalNaoConfirmados}\n\n`;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); 
        res.setHeader('Content-Disposition', 'attachment; filename="confirmacoes.txt"');
        
        res.status(200).send(cabecalho + textoFormatado);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('Arquivo confirmacoes.json não encontrado para download.');
            res.status(404).json({ message: 'Arquivo de confirmações não encontrado.' });
        } else {
            console.error('Erro ao baixar o arquivo de confirmações:', error);
            res.status(500).json({ message: 'Erro interno no servidor ao baixar o arquivo.' });
        }
    }
});

https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});