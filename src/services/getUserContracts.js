const { Op } = require('sequelize')
const { Contract } = require('../model')
const { CONTRACT_STATUSES } = require('../constants')

function getUserContractById (userId, contractId) {
  return Contract.findOne({
    where: {
      id: contractId,
      [Op.or]: [
        { ContractorId: userId },
        { ClientId: userId }
      ]
    }
  })
}

function getUserContracts (userId) {
  return Contract.findAll({
    where: {
      status: { [Op.ne]: CONTRACT_STATUSES.TERMINATED },
      [Op.or]: [
        { ContractorId: userId },
        { ClientId: userId }
      ]
    }
  })
}

module.exports = {
  getUserContractById,
  getUserContracts
}
