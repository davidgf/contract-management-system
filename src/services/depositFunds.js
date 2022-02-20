const createError = require('http-errors')
const { Profile } = require('../model')
const { PROFILE_TYPES } = require('../constants')
const { getUnpaidJobs } = require('./getUserJobs')

async function getUnpaidAmount (clientId) {
  const unpaidJobs = await getUnpaidJobs(clientId)
  const unpaidAmount = unpaidJobs.reduce((total, job) => job.price + total, 0)
  return unpaidAmount
}

async function getMaximumDeposit (clientId) {
  const unpaidAmount = await getUnpaidAmount(clientId)
  return unpaidAmount * 0.25
}

async function deposit (clientId, amount) {
  const maximumDeposit = await getMaximumDeposit(clientId)
  if (amount > maximumDeposit) throw createError(422, 'Deposit exceeds the maximum amount', { maximumDeposit })
  const client = await Profile.findOne({ where: { id: clientId, type: PROFILE_TYPES.CLIENT } })
  await client.increment({ balance: amount })
  return client.balance
}

module.exports = {
  deposit
}
