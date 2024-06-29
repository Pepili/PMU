class User {
  constructor(pseudo, email, password, token) {
    this.pseudo = pseudo;
    this.email = email;
    this.password = password;
    this.token = token;
  }
}

module.exports = User;
