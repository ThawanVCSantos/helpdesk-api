export class Category {
  constructor({ id, name, description = null, active = true, createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.active = active;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
