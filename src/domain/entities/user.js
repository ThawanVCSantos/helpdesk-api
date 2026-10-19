export class User {
  constructor({ id, name, email, password = null, active = false, roles = [], createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.active = active;
    this.roles = roles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
