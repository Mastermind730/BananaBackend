const express = require("express");
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const config = require('./config');
const cors = require('cors');
const { authenticateJWT } = require('./authMiddleware');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for clients to make API calls to this server
app.use(cors());
app.use(express.json());

// Apply authentication middleware globally
// app.use(authenticateJWT);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket authentication middleware
wss.on('connection', (ws, req) => {
  const token = req.url.split('token=')[1];
  if (!token) {
    ws.close(1008, 'Token is missing');
    return;
  }

  try {
    const payload = jwt.verify(token, config.secret);
    ws.user = payload;
  } catch (err) {
    ws.close(1008, 'Invalid token');
    return;
  }

  ws.on('message', (message) => {
    console.log(`Received message: ${message} from user: ${ws.user.id}`);
    // handle incoming messages
  });

  ws.send('Connected to WebSocket server');
});

// Import and use routers
const loginRouter = require('./routes/login');
const farmerRouter = require('./routes/farmer')(wss);
const userRouter = require('./routes/user')(wss);
const harvestedDataRouter = require('./routes/harvested_data')(wss);
const companyRouter = require('./routes/company')(wss);
const labourRouter = require('./routes/labour')(wss);
const billsRouter = require('./routes/bills');

// Define routes with their respective routers
app.use('/harvest', loginRouter);
app.use('/harvest', farmerRouter);
app.use('/harvest', userRouter);
app.use('/harvest', harvestedDataRouter);
app.use('/harvest', companyRouter);
app.use('/harvest', labourRouter);
app.use('/harvest', billsRouter);

// Default route handler for root
app.get('/', (req, res) => {
  res.send(utils.createResult(null, 'Harvest API server is running'));
});

// Catch-all route handler for any other paths
app.use('*', (req, res) => {
  res.status(404).send('Not Found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
