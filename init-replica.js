// init-replica.js
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb:27017' },
    // { _id: 1, host: 'mongodb_replica_set_2:27017' },
    // { _id: 2, host: 'mongodb_replica_set_3:27017' },
  ],
});
