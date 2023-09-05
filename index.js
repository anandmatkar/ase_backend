const express = require('express');
const cluster = require('cluster');
const os = require('os');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const connection = require('./src/database/connection')
const Router = require('./src/routes/index');
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
  // This code will be executed in worker processes

  app.use(cors());
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('uploads'));

  app.listen(process.env.LISTEN_PORT, () => {
    console.log(`Worker ${cluster.worker.id} | PORT ${process.env.LISTEN_PORT}`);
  });

  
app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  });
}
