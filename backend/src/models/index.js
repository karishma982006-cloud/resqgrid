import { getCollection } from '../config/db.js';

export const User = {
  find: (q) => getCollection('users').find(q),
  findOne: (q) => getCollection('users').findOne(q),
  findById: (id) => getCollection('users').findById(id),
  create: (d) => getCollection('users').create(d),
  insertMany: (docs) => getCollection('users').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('users').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('users').updateOne(q, u),
  deleteMany: (q) => getCollection('users').deleteMany(q),
  countDocuments: (q) => getCollection('users').countDocuments(q)
};

export const Department = {
  find: (q) => getCollection('departments').find(q),
  findOne: (q) => getCollection('departments').findOne(q),
  findById: (id) => getCollection('departments').findById(id),
  create: (d) => getCollection('departments').create(d),
  insertMany: (docs) => getCollection('departments').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('departments').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('departments').updateOne(q, u),
  deleteMany: (q) => getCollection('departments').deleteMany(q),
  countDocuments: (q) => getCollection('departments').countDocuments(q)
};

export const Agency = {
  find: (q) => getCollection('agencies').find(q),
  findOne: (q) => getCollection('agencies').findOne(q),
  findById: (id) => getCollection('agencies').findById(id),
  create: (d) => getCollection('agencies').create(d),
  insertMany: (docs) => getCollection('agencies').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('agencies').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('agencies').updateOne(q, u),
  deleteMany: (q) => getCollection('agencies').deleteMany(q),
  countDocuments: (q) => getCollection('agencies').countDocuments(q)
};

export const Resource = {
  find: (q) => getCollection('resources').find(q),
  findOne: (q) => getCollection('resources').findOne(q),
  findById: (id) => getCollection('resources').findById(id),
  create: (d) => getCollection('resources').create(d),
  insertMany: (docs) => getCollection('resources').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('resources').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('resources').updateOne(q, u),
  deleteMany: (q) => getCollection('resources').deleteMany(q),
  countDocuments: (q) => getCollection('resources').countDocuments(q)
};

export const Capability = {
  find: (q) => getCollection('capabilities').find(q),
  findOne: (q) => getCollection('capabilities').findOne(q),
  findById: (id) => getCollection('capabilities').findById(id),
  create: (d) => getCollection('capabilities').create(d),
  insertMany: (docs) => getCollection('capabilities').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('capabilities').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('capabilities').updateOne(q, u),
  deleteMany: (q) => getCollection('capabilities').deleteMany(q),
  countDocuments: (q) => getCollection('capabilities').countDocuments(q)
};

export const Report = {
  find: (q) => getCollection('reports').find(q),
  findOne: (q) => getCollection('reports').findOne(q),
  findById: (id) => getCollection('reports').findById(id),
  create: (d) => getCollection('reports').create(d),
  insertMany: (docs) => getCollection('reports').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('reports').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('reports').updateOne(q, u),
  deleteMany: (q) => getCollection('reports').deleteMany(q),
  countDocuments: (q) => getCollection('reports').countDocuments(q)
};

export const Case = {
  find: (q) => getCollection('cases').find(q),
  findOne: (q) => getCollection('cases').findOne(q),
  findById: (id) => getCollection('cases').findById(id),
  create: (d) => getCollection('cases').create(d),
  insertMany: (docs) => getCollection('cases').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('cases').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('cases').updateOne(q, u),
  deleteMany: (q) => getCollection('cases').deleteMany(q),
  countDocuments: (q) => getCollection('cases').countDocuments(q)
};

export const Problem = {
  find: (q) => getCollection('problems').find(q),
  findOne: (q) => getCollection('problems').findOne(q),
  findById: (id) => getCollection('problems').findById(id),
  create: (d) => getCollection('problems').create(d),
  insertMany: (docs) => getCollection('problems').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('problems').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('problems').updateOne(q, u),
  deleteMany: (q) => getCollection('problems').deleteMany(q),
  countDocuments: (q) => getCollection('problems').countDocuments(q)
};

export const Task = {
  find: (q) => getCollection('tasks').find(q),
  findOne: (q) => getCollection('tasks').findOne(q),
  findById: (id) => getCollection('tasks').findById(id),
  create: (d) => getCollection('tasks').create(d),
  insertMany: (docs) => getCollection('tasks').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('tasks').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('tasks').updateOne(q, u),
  deleteMany: (q) => getCollection('tasks').deleteMany(q),
  countDocuments: (q) => getCollection('tasks').countDocuments(q)
};

export const Dependency = {
  find: (q) => getCollection('dependencies').find(q),
  findOne: (q) => getCollection('dependencies').findOne(q),
  findById: (id) => getCollection('dependencies').findById(id),
  create: (d) => getCollection('dependencies').create(d),
  insertMany: (docs) => getCollection('dependencies').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('dependencies').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('dependencies').updateOne(q, u),
  deleteMany: (q) => getCollection('dependencies').deleteMany(q),
  countDocuments: (q) => getCollection('dependencies').countDocuments(q)
};

export const Assignment = {
  find: (q) => getCollection('assignments').find(q),
  findOne: (q) => getCollection('assignments').findOne(q),
  findById: (id) => getCollection('assignments').findById(id),
  create: (d) => getCollection('assignments').create(d),
  insertMany: (docs) => getCollection('assignments').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('assignments').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('assignments').updateOne(q, u),
  deleteMany: (q) => getCollection('assignments').deleteMany(q),
  countDocuments: (q) => getCollection('assignments').countDocuments(q)
};

export const Escalation = {
  find: (q) => getCollection('escalations').find(q),
  findOne: (q) => getCollection('escalations').findOne(q),
  findById: (id) => getCollection('escalations').findById(id),
  create: (d) => getCollection('escalations').create(d),
  insertMany: (docs) => getCollection('escalations').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('escalations').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('escalations').updateOne(q, u),
  deleteMany: (q) => getCollection('escalations').deleteMany(q),
  countDocuments: (q) => getCollection('escalations').countDocuments(q)
};

export const Notification = {
  find: (q) => getCollection('notifications').find(q),
  findOne: (q) => getCollection('notifications').findOne(q),
  findById: (id) => getCollection('notifications').findById(id),
  create: (d) => getCollection('notifications').create(d),
  insertMany: (docs) => getCollection('notifications').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('notifications').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('notifications').updateOne(q, u),
  deleteMany: (q) => getCollection('notifications').deleteMany(q),
  countDocuments: (q) => getCollection('notifications').countDocuments(q)
};

export const AuditLog = {
  find: (q) => getCollection('auditLogs').find(q),
  findOne: (q) => getCollection('auditLogs').findOne(q),
  findById: (id) => getCollection('auditLogs').findById(id),
  create: (d) => getCollection('auditLogs').create(d),
  insertMany: (docs) => getCollection('auditLogs').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('auditLogs').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('auditLogs').updateOne(q, u),
  deleteMany: (q) => getCollection('auditLogs').deleteMany(q),
  countDocuments: (q) => getCollection('auditLogs').countDocuments(q)
};

export const DisasterEvent = {
  find: (q) => getCollection('disasterEvents').find(q),
  findOne: (q) => getCollection('disasterEvents').findOne(q),
  findById: (id) => getCollection('disasterEvents').findById(id),
  create: (d) => getCollection('disasterEvents').create(d),
  insertMany: (docs) => getCollection('disasterEvents').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('disasterEvents').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('disasterEvents').updateOne(q, u),
  deleteMany: (q) => getCollection('disasterEvents').deleteMany(q),
  countDocuments: (q) => getCollection('disasterEvents').countDocuments(q)
};

export const PriorityRule = {
  find: (q) => getCollection('priorityRules').find(q),
  findOne: (q) => getCollection('priorityRules').findOne(q),
  findById: (id) => getCollection('priorityRules').findById(id),
  create: (d) => getCollection('priorityRules').create(d),
  insertMany: (docs) => getCollection('priorityRules').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('priorityRules').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('priorityRules').updateOne(q, u),
  deleteMany: (q) => getCollection('priorityRules').deleteMany(q),
  countDocuments: (q) => getCollection('priorityRules').countDocuments(q)
};

export const Jurisdiction = {
  find: (q) => getCollection('jurisdictions').find(q),
  findOne: (q) => getCollection('jurisdictions').findOne(q),
  findById: (id) => getCollection('jurisdictions').findById(id),
  create: (d) => getCollection('jurisdictions').create(d),
  insertMany: (docs) => getCollection('jurisdictions').insertMany(docs),
  findByIdAndUpdate: (id, u, o) => getCollection('jurisdictions').findByIdAndUpdate(id, u, o),
  updateOne: (q, u) => getCollection('jurisdictions').updateOne(q, u),
  deleteMany: (q) => getCollection('jurisdictions').deleteMany(q),
  countDocuments: (q) => getCollection('jurisdictions').countDocuments(q)
};

export default {
  User,
  Department,
  Agency,
  Resource,
  Capability,
  Report,
  Case,
  Problem,
  Task,
  Dependency,
  Assignment,
  Escalation,
  Notification,
  AuditLog,
  DisasterEvent,
  PriorityRule,
  Jurisdiction
};
