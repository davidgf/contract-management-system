const { Op } = require('sequelize')
const { Job, Contract } = require('../model')
const { CONTRACT_STATUSES } = require('../constants')

function getUnpaidJobs (userId) {
  return Job.findAll({
    include: {
      model: Contract,
      attributes: [],
      where: {
        [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
        status: CONTRACT_STATUSES.IN_PROGRESS
      }
    },
    where: {
      paid: { [Op.not]: true }
    }
  })
}

module.exports = {
  getUnpaidJobs
}
