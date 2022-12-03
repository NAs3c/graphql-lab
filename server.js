var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var uuid = require('uuid');
var cors = require('cors');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Role{
    name: String,
    privilege_level: Int,
    users: [User]
  }
  input UserInput {
    login: String,
    password: String,
    roles: [String]
  }
  type User {
    id: Int
    login: String
    password: String
    roles: [Role]
    api_key: String
  }
  type Query {
    me : User
    login(login: String, password: String) : String
  }
  type Mutation {
    createUser(input: UserInput) : User
  }
`);

// Define classes and variables

var current_user = 0;
var user_count = 0;
var userDatabase = {};
var roleDatabase = {
  admin : { name : 'admin', privilege_level : 0, users : [] },
  user : { name : 'user', privilege_level : 1, users : [] },
  guest : { name : 'guest', privilege_level : 2, users : [] }
};

class User{
  constructor(id, login, password, api_key) {
    this.id = id;
    this.login = login;
    this.password = password;
    this.roles = [];
    this.api_key = api_key;
  }
}

// The rootValue provides a resolver function for each API endpoint
var root = {
  me: () => {
    return userDatabase[current_user];
  },
  createUser: ({input}) => {
    id = user_count++;
    api_key = uuid.v4();
    new_user = new User(id, input.login, input.password, api_key);
    userDatabase[id] = new_user;
    if (input.roles != null) {
      if (current_user != 1) {
        return new Error('Vous n\'êtes pas autorisés à postionner des roles');
      }
    } else {
      input.roles = ['user'];
    }
    for (const role of input.roles) {
      userDatabase[id]['roles'].push(roleDatabase[role]);
      roleDatabase[role]['users'].push(new_user);
    }
    return new_user;
  },
  login: ({login, password}) => {
    const udb_keys = Object.keys(userDatabase);
    for (const user of udb_keys) {
      if (userDatabase[user]['login'] === login && userDatabase[user]['password'] === password) {
        current_user = userDatabase[user]['id'];
        return 'Successfully logged in as ' + login
      };
    };
    return 'Login failed';
  }
};

// Init databases with privileges and set back privilege to guest

current_user = 1;
root.createUser({ input : { login : 'guest', password : 'guest', roles : ['guest']}});
root.createUser({ input : { login : 'admin', password : 'ADm1nS3cr3t', roles : ['admin', 'user']}});
current_user = 0;

// Start app

var app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, '0.0.0.0');
console.log('Running a GraphQL API server at http://0.0.0.0:4000/graphql');
