const { sequelize, Job, Contract, Profile } = require('../model')
const createError = require('http-errors')
const { UnprocessableEntity, NotFound, InternalServerError } = createError

async function getPayableJobWithContract (clientProfile, jobId) {
  const job = await Job.findOne({
    where: {
      id: jobId
    },
    include: { model: Contract }
  })
  if (!job || job.Contract.ClientId !== clientProfile.id) throw NotFound('Job not found')
  if (job.paid) throw new UnprocessableEntity('Job already paid')
  if (job.price > clientProfile.balance) throw new UnprocessableEntity('Insufficient funds')
  return job
}

function performPayment (clientProfile, jobWithContract) {
  return sequelize.transaction(async (transaction) => {
    const { price } = jobWithContract
    const contractorId = jobWithContract.Contract.ContractorId
    await Profile.increment({ balance: price }, { where: { id: contractorId }, transaction })
    await clientProfile.decrement({ balance: price }, { transaction })
    const job = await jobWithContract.update({ paid: true, paymentDate: Date.now() }, { transaction })
    return job
  })
}

async function payJob (clientProfile, jobId) {
  try {
    const jobWithContract = await getPayableJobWithContract(clientProfile, jobId)
    const paidJob = await performPayment(clientProfile, jobWithContract)
    return paidJob
  } catch (error) {
    if (createError.isHttpError(error)) throw error
    throw new InternalServerError('Error processing payment')
  }
}

module.exports = {
  payJob
}
