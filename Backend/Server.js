const express = require('express');
const cors = require('cors');
const app = express()
require('./database/mongodb')
const productsRoutes = require('../Riuraj Backend/routes/ProductsRoutes')
app.use(express.json());
app.use(cors({
    origin : "http://localhost:5173",
    methods: ['GET' , 'PUT' , 'PATCH' , 'POST']
 }))


 const PORT=5000
 app.get('/' , async (req , res)=>{
   return res.status(201).json({mesage: "server is running on port"})
 })

 app.use('/api' , productsRoutes )

 app.listen(5000 , ()=>{
    console.log(`server is running port http://localhost:${PORT}`);
 })