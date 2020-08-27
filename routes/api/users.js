const express = require('express');
const {check, validationResult} = require('express-validator');
//const { model } = require('mongoose');
const router =express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');

const bcrypt =require('bcryptjs');

const User= require('../../models/User');

//@route  POST  api/user
//@desc   Register user
//@access public
router.post('/',[
    check('name','Name is required')
    .not()
    .notEmpty(),
    check('email','Please a valid email').isEmail(),
    check('password','please enter a password with 6 or more charater').isLength({min:6})
], 
async (req,res)=> {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const { email , name , password}= req.body;
    try{
        //see if user exists
         let user = await User.findOne({email});
        if(user){
            return  res.status(400).json({errors:[{msg :'User already exists'}]});
        }
        //get users gravatar
    
        const avatar =gravatar.url(email,{
            s:"200",
            r:"pg",
            d:"mm"
        });
    
        user =new User({
            name,
            email,
            avatar,
            password
        });
     

          //ecrypt password 
        const salt =await bcrypt.genSalt(10);
    
        user.password = await bcrypt.hash(password,salt);
    
        await user.save();
      
    
        const payload = {
            user:{
                id :  user.id
            }
        };

        //console.log(user.id);
    
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
    //res.send("user route")});

module.exports=router;