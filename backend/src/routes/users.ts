import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { getMe } from '../controllers/userController'

const router = Router()

router.use(authenticateToken)

router.get('/me', getMe)

export default router