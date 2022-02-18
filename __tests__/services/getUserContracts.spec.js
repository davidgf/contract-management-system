const { Op } = require('sequelize')
const { getUserContractById, getUserContracts } = require('../../src/services/getUserContracts')
const { Contract } = require('../../src/model')
const { CONTRACT_STATUSES } = require('../../src/constants')

describe('getUserContracts', () => {
  describe('.getUserContractById()', () => {
    const contractId = 5
    const userId = 10
    const findOneResponse = { foo: 'bar' }

    beforeEach(() => {
      jest.spyOn(Contract, 'findOne').mockResolvedValue(findOneResponse)
    })
    afterAll(() => jest.restoreAllMocks())

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

  describe('.getUserContracts()', () => {
    const userId = 3
    const findAllResponse = [{ foo: 'bar' }, { baz: 'foo' }]

    beforeAll(() => {
      jest.spyOn(Contract, 'findAll').mockResolvedValue(findAllResponse)
    })
    afterAll(() => jest.restoreAllMocks())

    it('fetches the non terminated contracts for a certain user', () => {
      getUserContracts(userId)
      const expected = {
        where: {
          status: { [Op.ne]: CONTRACT_STATUSES.TERMINATED },
          [Op.or]: [
            { ContractorId: userId },
            { ClientId: userId }
          ]
        }
      }
      expect(Contract.findAll).toHaveBeenCalledWith(expected)
    })

    it('resolves findAll response', async () => {
      const actual = await getUserContracts(userId)
      expect(actual).toBe(findAllResponse)
    })
  })
})
