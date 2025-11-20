const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.send('Server working');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  console.log("새로운 WebSocket 연결!", req.url);

  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  let username = null;
  try {
    const decoded = jwt.verify(token, "ygolddecodementtestdecoderloginsigninpage");
    username = decoded.username;
  } catch (err) {
    console.error("JWT 인증 실패:", err);   // ★ 추가
    ws.close();
    return;
  }

  ws.username = username;
  console.log(`WebSocket 인증 성공: ${username}`);

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          username: ws.username,
          content: data.content
        }));
      }
    });
  });

  ws.on("close", () => {
    console.log(`WebSocket 연결 종료: ${username}`);
  });
});

let users = [];

app.use(express.static("public"));

app.post('/api/register', async (req,res) => {
  const { username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({message:"Check ID & PW"});
  }

  const existID = users.find(u => u.username === username);
  if(existID){
    return res.status(400).json({ message:"Existing ID"});
  }

  const bcrypt = require('bcrypt');
  const hashedPassord = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hashedPassord
  });

  console.log("Registered: ", users);

  res.json({ message: "Sucess" });

});

app.post('/api/login', async (req,res) => {
  const {username,password} = req.body;
  
  if(!username || !password){
    return res.status(400).json({message:"Check ID & PW"});
  }

  const user = users.find(u => u.username === username);
  if(!user){
    return res.status(400).json({ message:"Not existing ID"});
  }

  const bcrypt = require('bcrypt');
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Wrong PW" });
  }

  const SECRET_KEY = "ygolddecodementtestdecoderloginsigninpage";

  const token = jwt.sign(
    { username: user.username },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.json({
    message: "로그인 성공!",
    token
  });
});
