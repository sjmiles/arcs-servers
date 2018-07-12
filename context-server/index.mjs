import {Field} from './Field.mjs';
import {FbUser} from './FbUser.mjs';

const users = {};

let messages = [];

const userObjectChanged = (userid, kind, field, value) => {
  messages.push({kind: `user-${kind}`, userid, key: field.key, disposed: field.disposed, value});
  /*
  const bits = user.bits || (user.bits = Object.create(null));
  const bag = bits[kind] || (bits[kind] = Object.create(null));
  if (field.disposed) {
    delete bag[field.key];
  } else {
    bag[field.key] = value;
  }
  */
};

const userQueryResponse = (user, type, field) => {
  console.log(type, field.key);
  switch (type) {
    case 'arc-changed':
      userObjectChanged(user.id, 'arc', field, field.key);
      //console.log(field.value);
      break;
    case 'share-changed':
      const value = field.value;
      delete value.steps;
      delete value.serialization;
      userObjectChanged(user.id, 'share', field, value);
      //console.log(field.value);
      break;
  }
  //console.log(type, field.key);
};

const usersField = new Field('/users', {
  '*': {
    $changed: field => userChanged(field)
  }
});
usersField.activate();

const userChanged = user => {
  if (user.disposed) {
    user.context.dispose();
    delete user[user.key];
    messages.push({kind: `user-remove`, userid: user.id, key: user.key, disposed: true});
  } else {
    messages.push({kind: `user-changed`, userid: user.id, key: user.key, disposed: false, value: user.value});
    if (!user[user.key]) {
      users[user.key] = user;
      user.id = user.key;
      user.context = new FbUser((type, field) => userQueryResponse(user, type, field));
      user.context.userid = user.key;
      console.log(`created context for ${user.key}`);
    }
  }
};

const dump = () => {
  console.log('');
  console.log(new Date().toLocaleTimeString());
  console.log('======================================================');
  console.log('| Users                                              |');
  console.log('======================================================');
  console.log('|     # | Id                    | Name               |');
  console.log('======================================================');
  Object.values(users).forEach((user, i) => {
    const value = user.value;
    const name = value.info ? value.info.name : '(n/a)';
    console.log(`|  ${`   ${i}`.slice(-4)} | ${user.id}  | ${name}`);
  });
  console.log('======================================================');
};

setTimeout(dump, 2000);
//setInterval(dump, 10000);

import express from './node_modules/express';

const app = express();
app.get('/', (req, res) => {
  const world = {
    users: {}
  };
  Object.values(users).forEach(user => {
    const value = user.value;
    world.users[user.id] = {
      id: user.id,
      name: value.info && value.info.name || '(n/a)'
    };
  });
  const user = users['-L8ZV2_gCxnL4SSz-16-']; // Cletus
  if (user) {
    world.user = user.value;
    world.user.profile = user.bits;
    //const profile = world.user.profile = {};
    // Object.keys(user.bits).forEach(kind => {
    //   const section = profile[kind] = {};
    //   const bag = user.bits[kind];
    //   Object.keys(bag).forEach(key => {
    //     section[key] = bag[key].value;
    //   });
    // });
    //world.user.bits = user.bits;
  }
  //Object.values(users).forEach((user, i) => {
  //  world[user.id] = user.value;
  //});
  res.set('Content-Type', 'text/json');
  res.set('Access-Control-Allow-Origin', '*');
  //res.send(JSON.stringify(world, null, '  '));
  res.send(JSON.stringify(messages, null, '  '));
  messages = [];
});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
