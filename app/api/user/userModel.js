"use strict";
var knex = require(`${__base}/config/connections.js`);
var co = require('co');


class User {
  /**
   * Creates a new user in the database
   * @param {string} email - a unique email address
   */
  createNewUser(email) {
    var promise = knex('users')
      .returning('*')
      .insert({
        email: email
      }).then(users => {
        return users[0]
      })
    return promise;
  }

  getAll() {
    var promise = knex
        .select('*')
        .from('users');

    return promise;
  }

  /**
   *  Select an individual user by email adress
   *  @param {string} email - users email
   *  @return {promise} containing a user object if found, undefined otherwise
   */
  getByEmail(email) {
    var promise = knex('users')
      .where({
        email: email
      })
      .select('*')
      .limit(1)
      .then(users => {
        console.log(users)
        return users[0]
      });
    return promise;
  }

  /**
   *  Select an individual user by ID
   *  @param {string} id - users unique id
   *  @return {promise} containing a user object if found, undefined otherwise
   */
  getById(id) {
    return knex('users')
      .where({ id: id })
      .select('*')
      .limit(1)
      .then(users => users[0]);
  }

  /////////////////////////////////////////////////////////////////////
  //////////////////////////// CONNECTIONS ////////////////////////////
  /////////////////////////////////////////////////////////////////////

  getConnections(id) {
    return knex.select('id', 'email')
        .from('connections')
        .innerJoin('users', function(){
          this.on('users.id', '=', 'connections.user_b_id')
            .orOn('users.id', '=', 'connections.user_a_id')
        })
        .whereNot({id: id})
  }

  addConnectionByEmail(userAEmail, userBEmail) {
    return co(function* () {

      var users = yield knex('users')
        .where({ email: userAEmail })
        .orWhere({ email: userBEmail })
        .select('*');

      if(users.length < 2) return {error: 'User not found'}

      var newConnection = {
        user_a_id: users[0].id,
        user_b_id: users[1].id
      };
      try {
        var connections =  yield knex('connections').insert(newConnection);
        return knex.select('id', 'email')
            .from('connections')
            .innerJoin('users', function(){
              this.on('users.id', '=', 'connections.user_b_id')
                .orOn('users.id', '=', 'connections.user_a_id')
            })
            .whereNot({email: userAEmail})
      } catch(e) { return {error: e.detail}; }
      return connections
    });
  }

  removeConnectionById(userAId, userBId){
    return co(function* () {
      return knex('connections')
        .where('user_a_id', userAId)
        .orWhere('user_a_id', userBId)
        .orWhere('user_b_id', userAId)
        .orWhere('user_b_id', userBId)
        .del()
    });
  }
}


module.exports = new User();
