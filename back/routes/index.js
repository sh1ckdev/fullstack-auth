const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const {body, check} = require ('express-validator')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/role-middleware')


router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration)
router.post('/signin', userController.login)
router.post('/auth/yandex', userController.loginWithYandex)
router.get('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.post('/forgot-password', userController.forgotPassword)
router.post('/reset-password', userController.resetPassword)
router.get('/user/:username',authMiddleware, userController.getUser)
router.get('/me', authMiddleware, userController.me)
router.patch('/me', authMiddleware, userController.updateMe)
router.get('/admin/ping', authMiddleware, roleMiddleware(['admin']), (req, res) => res.json({ ok: true }))
router.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }))



module.exports = router