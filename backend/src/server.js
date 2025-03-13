const express = require("express");
const Web3 = require("web3");
const bitcoin = require("bitcoinjs-lib");
const dotenv = require("dotenv");
const path = require("path");
const axios = require('axios');
const cors = require('cors');

dotenv.config(); // Carrega as variáveis de ambiente

const app = express();
app.use(express.json());
app.use(cors()); // Mover para cima

// Configurar o provedor Ethereum
const web3 = new Web3("http://127.0.0.1:7545");

// Endpoint para verificar saldo Ethereum
app.get("/eth-balance", async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    res.send({
      address: accounts[0],
      balance: web3.utils.fromWei(balance, "ether"),
    });
  } catch (error) {
    res.status(500).send({ error: "Erro ao acessar saldo Ethereum" });
  }
});

// Endpoint para criar uma carteira Bitcoin
app.get("/btc-wallet", (req, res) => {
  const keyPair = bitcoin.ECPair.makeRandom(); // Gera uma chave aleatória
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }); // Gera o endereço a partir da chave pública
  res.send({ address });
});

// Endpoint para buscar o preço do Ethereum
app.get('/api/eth-price', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,aoa');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o preço do Ethereum' });
    }
});

// Configuração para produção (caso esteja hospedando)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "wallet-app", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "wallet-app", "build", "index.html"));
  });
}

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
