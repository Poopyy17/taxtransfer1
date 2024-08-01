import express from 'express'
import Service from '../models/serviceModel.js';
import data from '../data.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
    await Service.deleteMany({});
    const createdServices = await Service.insertMany(data.services);
    await User.deleteMany({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdServices, createdUsers });
});

export default seedRouter;