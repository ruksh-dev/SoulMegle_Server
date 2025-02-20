import {Router} from 'express'
import passport from 'passport'
import checkAuth from '../middlewares/checkAuth'
import getUser from '../middlewares/getUser'
import getSimilarUsers from '../middlewares/getSimilarUsers'
import addUser from '../services/addUser'
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router=Router();

router.get('/user/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:5173');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout(err=>{
    if(err) return next(err);
  });
  res.redirect('http://localhost:5173');
});

// protected routes
router.get('/api/user',checkAuth,getUser);
router.post('/api/user/get-similar-users',checkAuth,upload.single('audio'),getSimilarUsers);
router.get('/api/user/add',checkAuth,addUser);

export const AllRoutes=router;