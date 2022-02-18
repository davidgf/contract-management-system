const { Op } = require('sequelize')
const { Contract } = require('../model')

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

module.exports.getUserContractById = getUserContractById
