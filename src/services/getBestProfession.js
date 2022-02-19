const { Op } = require('sequelize')
const { Job, Contract, Profile } = require('../model')
const { CONTRACT_STATUSES } = require('../constants')

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
          type: 'contractor'
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

function getTopEarner (amountsByProfession) {
  return Object.entries(amountsByProfession).sort((a, b) => b[1] - a[2])[0]
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
