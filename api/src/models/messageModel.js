class Message {
  constructor(content, roomId, userId) {
    this.content = content;
    this.roomId = roomId;
    this.userId = userId;
  }
}

module.exports = Message;
