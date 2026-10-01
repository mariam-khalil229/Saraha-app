import express from 'express';
import ConnectionDB from './DB/connectionDB.js';
import userRoutes from './modules/users/user.routes.js';
import cors from 'cors';

const app = express();
const port = 3000;
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

const bootstrap = async () => {
    app.use(cors(corsOptions));
    app.use(express.json());
    await ConnectionDB()

    app.use('/api/users', userRoutes);
    app.get('/', (req, res) => res.status(200).json({ message: "Welcome on sara7a app" }))
    app.use("*", (req, res, next) => {
        res.status(404).json({
            message: `Url:${req.originalUrl} With Method:${req.method} Not Found`,
            statusCode: 404
        })
    })

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default bootstrap