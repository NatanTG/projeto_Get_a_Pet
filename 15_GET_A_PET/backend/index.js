import express from 'express';
import cors from 'cors';
import conn from './db/conn.js';


const app = express();

//config json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

//public folder for images
app.use(express.static('public'));

//routes
import UserRoutes from './routes/UserRoutes.js';
import PetRoutes from './routes/PetRoutes.js';
app.use('/pets', PetRoutes);
app.use('/users', UserRoutes);


app.listen(5000)