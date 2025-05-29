import express from 'express'
import subscribeControllers from './subscribe.controllers'

const subscriberRouter = express.Router()

subscriberRouter.post('/create', subscribeControllers.createSubscriber)

export default subscriberRouter