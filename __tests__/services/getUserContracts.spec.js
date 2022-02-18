const { Op } = require('sequelize')
const { getUserContractById } = require('../../src/services/getUserContracts')
const { Contract } = require('../../src/model')

describe('getUserContracts', () => {
  describe('.getUserContractById()', () => {
    const contractId = 5
    const userId = 10
    const findOneResponse = { foo: 'bar' }

    beforeAll(() => {
      jest.spyOn(Contract, 'findOne').mockResolvedValue(findOneResponse)
    })
    afterAll(() => jest.clearAllMocks())

    it('fetches an user\'s contract by ID', () => {
      getUserContractById(userId, contractId)
      const expected = {
        where: {
          id: contractId,
          [Op.or]: [
            { ContractorId: userId },
            { ClientId: userId }
          ]
        }
      }
      expect(Contract.findOne).toHaveBeenCalledWith(expected)
    })

    it('resolves findOne response', async () => {
      const actual = await getUserContractById(userId, contractId)
      expect(actual).toBe(findOneResponse)
    })
  })
})
