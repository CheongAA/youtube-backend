import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { videoRouter } from './routes/video';
import { userRouter } from './routes/user';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();
const apiPrefix = '/api/v1/';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.use(`${apiPrefix}auth`, authRouter);
app.use(`${apiPrefix}admin`, adminRouter);
app.use(`${apiPrefix}videos`, videoRouter);
app.use(`${apiPrefix}users`, userRouter);

app.use(errorHandler);

app.listen(PORT, console.log(`Server started at http://localhost:${PORT}, ${process.env.DB_NAME}`));
