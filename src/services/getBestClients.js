const { Op } = require('sequelize')
const { Job, Contract, Profile } = require('../model')
const { PROFILE_TYPES } = require('../constants')

function getPaidJobsInRangeWithClient (start, end) {
  return Job.findAll({
    attributes: ['price'],
    include: {
      model: Contract,
      attributes: ['ClientId'],
      include: {
        model: Profile,
        as: 'Client',
        attributes: ['id', 'firstName', 'lastName'],
        where: {
          type: PROFILE_TYPES.CLIENT
        }
      }
    },
    where: {
      paymentDate: { [Op.between]: [start, end] }
    }
  })
}

function getAmountByClient (jobsWithClient) {
  return jobsWithClient.reduce((total, job) => {
    const client = job.Contract.Client
    if (!total[client.id]) total[client.id] = { paid: 0, fullName: client.fullName }
    total[client.id].paid += job.price
    return total
  }, {})
}

function getTopEarners (amountsByClient = {}, limit) {
  const sortedEarners = Object.entries(amountsByClient)
    .map(el => {
      const [id, { paid, fullName }] = el
      return { id, paid, fullName }
    })
    .sort((a, b) => b.paid - a.paid)
    .slice(0, limit)
  return sortedEarners
}

async function bestClientsInRange (start, end, limit = 2) {
  const paidJobsWithClient = await getPaidJobsInRangeWithClient(start, end)
  const amountsByClient = getAmountByClient(paidJobsWithClient)
  const topEarners = getTopEarners(amountsByClient, limit)
  return topEarners
}

module.exports = {
  bestClientsInRange
}
