import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import livestockRoutes from './routes/livestockRoutes';
import slaughterRoutes from './routes/slaughterRoutes';
import transactionRoutes from './routes/transactionRoutes';
import expenseRoutes from './routes/expenseRoutes';
import allowanceRoutes from './routes/allowanceRoutes';
import investmentRoutes from './routes/investmentRoutes';
import productRoutes from './routes/productRoutes';
import reportRoutes from './routes/reportRoutes';
import auditRoutes from './routes/auditRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/slaughter', slaughterRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/allowance', allowanceRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Keep process alive hack (required for some reason)
      setInterval(() => {}, 1000 * 60 * 60);
    });

    // Handle unexpected exits
    process.on('exit', (code) => {
        console.log(`About to exit with code: ${code}`);
    });

    process.on('SIGINT', () => {
        console.log('Received SIGINT. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
    
    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
