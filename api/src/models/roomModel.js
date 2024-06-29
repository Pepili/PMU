class Room {
  constructor(status, code, maxNbPlayers, adminId, userIds) {
    this.status = status;
    this.code = code;
    this.maxNbPlayers = maxNbPlayers;
    this.adminId = adminId;
    this.userIds = userIds;
  }
}

module.exports = Room;
