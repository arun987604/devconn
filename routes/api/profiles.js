const express = require('express');
const router =express.Router();
const request = require('request');
const config = require('config');
const { check,validationResult}= require ('express-validator');
const auth =require('../../middleware/auth');

const Profile= require('../../models//profile');
const User= require('../../models/User');
const Post= require('../../models/Post');
const { get } = require('config');
//const { request, response } = require('express');

//@route  GET  api/profile/me
//@desc   get current user pofile
//@access private
router.get('/me',auth, async (req,res)=>{
    try{
    const profile= await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);

    if(!profile){
        return res.status(400).json( {msg:'There is no profile for this user'});                                                   
    }
    res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

//@route  post  api/profile
//@desc   create or update user profile
//@access private

router.post('/',[auth,[
    check('status','status is required')
    .not()
    .isEmpty(),
    check('skills','Skills is required')
    .not()
    .isEmpty()
]], async (req,res) => {
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      //build profile objects
      try{
      const profilFields={};
      profilFields.user=req.user.id;
      if(company)profilFields.company=company;
      if(website)profilFields.website=website;
      if(location)profilFields.location=location;
      if(bio)profilFields.bio=bio;
      if(status)profilFields.status=status;
      if(githubusername)profilFields.githubusername=githubusername;
      if(skills){
          profilFields.skills=skills.split(',').map(skill=>skill.trim());
      }
      
      //build social object

      profilFields.social={};
      if(youtube)profilFields.social.youtube=youtube;
      if(twitter)profilFields.social.twitter=twitter;
      if(facebook)profilFields.social.facebook=facebook;
      if(instagram)profilFields.social.instagram=instagram;
      if(linkedin)profilFields.social.linkedin=linkedin;

      try{
        let profile= await Profile.findOne({ user:req.user.id});

        if(profile){
            profile=await Profile.findOneAndUpdate({
                user:req.user.id},
                {$set:  profilFields},
                {new : true});
                return res.json(profile);
        }
        //create a profile
        profile= new Profile(profilFields);

        await profile.save();
        res.json(profile);
      }
      catch(err){
          console.error(err.message);
          res.status(400).send('Server error');
      }

      //console.log(profilFields.skills);
      //res.send("hi");
    }
    catch(err){
        res.status(400);
    }
});

//@route  get  api/profile
//@desc   get all profile
//@access public

router.get('/', async (req,res)=>{
    try {
        const profiles= await Profile.find().populate('user',['name', 'avatar']);
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
//@route  get  api/profile/user/:user_id
//@desc   get profile by user_id
//@access public

router.get('/user/:user_id', async (req,res)=>{
    try {
        const profile= await Profile.findOne({user: req.params.user_id}).populate('user',['name', 'avatar']);

        if(!profile) return res.status(400).json({msg:'Profile not found'});
        res.send(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg:'Profile not found'});
        }
        res.status(500).send('Server error');
    }
});

//@route  get  api/profile
//@desc   delete profile ,user and post
//@access private

router.delete('/', auth,async (req,res)=>{
    try {

        //remove user post
        await Post.deleteMany({user:req.user.id});

         await Profile.findOneAndRemove({  user:req.user.id});
         //todo delete user
         await User.findOneAndRemove({_id:req.user.id});
         res.json('User deleted');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route  get  api/profile/experience
//@desc   add profile experience
//@access private

router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is required')
    .not()
    .isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }= req.body;

    const newExper={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };
    try {
        const profile= await Profile.findOne({user:   req.user.id});

       
        profile.experience.unshift(newExper);
      

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  delete  api/profile/experience/:exp_id
//@desc   delete profile experience
//@access private

router.delete('/experience/:exp_id',auth,async (req,res) =>{

    try {
        const profile= await Profile.findOne({user:   req.user.id});

        const removeIndex= profile.experience.map(item =>item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From date is required and needs to be from the past')
          .not()
          .isEmpty()
          .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/profile/education/:edu_id
  // @desc     Delete education from profile
  // @access   Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile= await Profile.findOne({user:   req.user.id});

        const removeIndex= profile.education.map(item =>item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);

        await profile.save();

        res.json(profile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

  // @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
    try {
     const options ={
         uri:'`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc',
         method:"GET",
         headers:{'user-agent':'node.js'}
     };

     request(options, (error,response,body)=>{
         if(error) console.error(error);

         if(response.statusCode  !==200){
             return res.status(404).json({msg:'No Github profile found'});
         }

         res.json(JSON.parse(body));
     });
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });
  
module.exports=router;