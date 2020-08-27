const express = require('express');
const router =express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt =require('bcryptjs');
const config = require('config');
const User = require('../../models/User');

//@route  GET  api/auth
//@desc   test route
//@access public
router.get('/', auth ,async (req,res) =>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route  POST  api/auth
//@desc   Register user
//@access public
router.post('/',[
    
    check('email','Please a valid email').isEmail(),
    check('password','please enter a password with 6 or more charater').exists()
], 
async (req,res)=> {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const { email ,password}= req.body;
    try{
        //see if user exists
         let user = await User.findOne({email});
        if(!user){
            return  res.status(400).json({errors:[{msg :'Invalid credential'}]});
        }
        
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return  res.status(400).json({errors:[{msg :'Invalid credential'}]});
        }
    
      
    
        const payload = {
            user:{
                id :  user.id
            }
        };
    
        jwt.sign(payload,
            config.get('jwtSecret'),
            {expiresIn: '5 days'},
            (err,token) => {
                if(err) throw err;
                res.json({ token });
            }
        );
        //res.send('User Registered');
    
        //return jsonwebtoken
    
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
}
);

module.exports=router;