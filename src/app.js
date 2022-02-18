const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const app = express()
const swaggerUi = require('swagger-ui-express')
const openApiDocument = require('../openapi.json')

app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const { id } = req.params
  const contract = await Contract.findOne({ where: { id } })
  if (!contract) return res.status(404).end()
  res.json(contract)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

module.exports = app
