const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const {body, check} = require ('express-validator')
const authMiddleware = require('../middlewares/authMiddleware')


router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration)
router.post('/login', userController.login)
router.get('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/user/:username',authMiddleware, userController.getUser)



module.exports = router