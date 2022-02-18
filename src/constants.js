const CONTRACT_STATUSES = Object.freeze({
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  TERMINATED: 'terminated'
})

const PROFILE_TYPES = Object.freeze({
  CLIENT: 'client',
  CONTRACTOR: 'contractor'
})

module.exports = {
  CONTRACT_STATUSES,
  PROFILE_TYPES
}
