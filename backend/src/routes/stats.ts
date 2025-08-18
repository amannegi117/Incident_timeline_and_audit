import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { getStats } from '../controllers/statsController'

const router = Router()

router.use(authenticateToken)

router.get('/', getStats)

export default router