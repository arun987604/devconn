const express = require('express');
const connectDB = require('./config/db');

const app = express();

//connect db

connectDB();

//INIT middelware
//use for getting request body
app.use(express.json({extended:false}));

app.get('/',(req,res)=> res.send('API is running'));

app.use('/api/users',require('./routes/api/users'));  
app.use('/api/posts',require('./routes/api/posts'));  
app.use('/api/auth',require('./routes/api/auth'));  
app.use('/api/profiles',require('./routes/api/profiles'));  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));