import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import clientRoutes from './routes/client.routes.js';
import cors from "cors";
import { PORT } from './config.js';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(userRoutes);
app.use(clientRoutes);
app.use(eventsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
