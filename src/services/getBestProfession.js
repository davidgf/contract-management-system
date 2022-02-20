const { Op } = require('sequelize')
const { Job, Contract, Profile } = require('../model')
const { PROFILE_TYPES } = require('../constants')

function getPaidJobsInRange (start, end) {
  return Job.findAll({
    attributes: ['price'],
    include: {
      model: Contract,
      attributes: ['ContractorId'],
      include: {
        model: Profile,
        as: 'Contractor',
        attributes: ['profession'],
        where: {
          type: PROFILE_TYPES.CONTRACTOR
        }
      }
    },
    where: {
      paymentDate: { [Op.between]: [start, end] }
    }
  })
}

function getAmountByProfession (jobsWithProfession) {
  return jobsWithProfession.reduce((total, job) => {
    const { profession } = job.Contract.Contractor
    if (!total[profession]) total[profession] = 0
    total[profession] += job.price
    return total
  }, {})
}

function getTopEarner (amountsByProfession = {}) {
  return Object.entries(amountsByProfession).sort((a, b) => b[1] - a[1])[0] || [null, null]
}

async function bestProfessionInRange (start, end) {
  const paidJobs = await getPaidJobsInRange(start, end)
  const amountsByProfession = getAmountByProfession(paidJobs)
  const [profession, amount] = getTopEarner(amountsByProfession)
  return { profession, amount }
}

module.exports = {
  bestProfessionInRange
}
