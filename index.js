const express = require('express');
const cluster = require('cluster');
const os = require('os');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const Router = require('./src/routes/index');
const session = require('express-session');
// Check if the current process is the master process
if (cluster.isMaster) {
  // Get the number of CPU cores
  const numCPUs = os.cpus().length;

  // Fork a worker for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for the exit event and fork a new worker if one exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  
  const corsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // enable credentials (if needed)
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('uploads'));

  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Use secure: true for HTTPS
  }));

  app.listen(process.env.LISTEN_PORT, () => {
    console.log(`Worker ${cluster.worker.id} | PORT ${process.env.LISTEN_PORT}`);
  });

  
app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  });
}
