const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const app = express()
const createError = require('http-errors')
const swaggerUi = require('swagger-ui-express')
const swaggerValidation = require('openapi-validator-middleware')
const openApiDocument = require('../openapi.json')
const { getUserContractById, getUserContracts } = require('./services/getUserContracts')
const { getUnpaidJobs } = require('./services/getUserJobs')
const { payJob } = require('./services/payJob')

swaggerValidation.init('openapi.json')

app.use(bodyParser.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', [swaggerValidation.validate, getProfile], async (req, res) => {
  const { id } = req.params
  const contract = await getUserContractById(req.profile.id, id)
  if (!contract) return res.status(404).end()
  res.json(contract)
})

app.get('/contracts', [swaggerValidation.validate, getProfile], async (req, res) => {
  const contracts = await getUserContracts(req.profile.id)
  res.json(contracts)
})

app.get('/jobs/unpaid', [swaggerValidation.validate, getProfile], async (req, res) => {
  const jobs = await getUnpaidJobs(req.profile.id)
  res.json(jobs)
})

app.post('/jobs/:id/pay', [swaggerValidation.validate, getProfile], async (req, res, next) => {
  try {
    const job = await payJob(req.profile, req.params.id)
    res.json(job)
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  if (err instanceof swaggerValidation.InputValidationError) {
    return res.status(400).json({ errors: err.errors })
  }
  if (createError.isHttpError(err)) {
    return res.status(err.status).send(err)
  }
})

module.exports = app
