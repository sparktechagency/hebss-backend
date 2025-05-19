import mongoose from 'mongoose';
import config from './config';
import app from './app';
import cron from 'node-cron';
import invoiceServices from './app/modules/invoiceModule/invoice.services';

let server: any;

// handle uncaught exception error
process.on('uncaughtException', (error) => {
  console.log('uncaughtException error', error);
  process.exit(1);
});

cron.schedule('0 0 1 * *', async () => {
  await invoiceServices.createInvoice();
  console.log('Invoice created successfully');
});

const startServer = async () => {
  await mongoose.connect(config.mongodb_url as string);
  console.log('\x1b[36mDatabase connection successfull\x1b[0m');

  server = app.listen(config.server_port || 5002, () => {
    console.log(`\x1b[32mServer is listening on port ${config.server_port || 5002}\x1b[0m`);
  });
};

// handle unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log(`unhandle rejection at ${promise} and reason ${reason}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// gracefull shoutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');
  server.close(() => {
    console.log('Server closed.');
  });
});

startServer();
