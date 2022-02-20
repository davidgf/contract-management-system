const { Op } = require('sequelize')
const { sequelize, Job, Contract, Profile } = require('../model')
const { PROFILE_TYPES } = require('../constants')

function getPaidAmountWithClients (start, end, limit) {
  return Job.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('price')), 'paid'],
      'Contract.ContractorId'
    ],
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
    where: { paymentDate: { [Op.between]: [start, end] } },
    group: 'Contract.ClientId',
    order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
    limit
  })
}

function formatAmountWithClients (amountWithClients) {
  return amountWithClients.map(el => {
    const { paid } = el
    const { id, fullName } = el.Contract.Client
    return { id, fullName, paid }
  })
}

async function bestClientsInRange (start, end, limit = 2) {
  const amountWithClients = await getPaidAmountWithClients(start, end, limit)
  const formattedClients = formatAmountWithClients(amountWithClients)
  return formattedClients
}

module.exports = {
  bestClientsInRange
}
