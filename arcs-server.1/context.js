const scope = (typeof window !== 'undefined') ? window : global;
const eventTarget = {};

const snarfId = key => {
  return key.split('/').pop();
};

const addUser = async (storage, user) => {
  user.arcs.forEach(key => {
    addArc(storage, user.id, key);
  });
};

const onHandleChange = (field, info) => {
  console.log(`[${field.id}] (change): `, info);
};

const addArc = async (storage, ownerid, storageKey) => {
  const field = scope.field = {
    id: snarfId(storageKey),
    ownerid: ownerid,
    fields: []
  };
  field.store = await storage.connect(`id${Math.random()}`, null, `synthetic://arc/handles/${storageKey}/serialization`);
  field.store.on('change', info => onHandleChange(field, info), eventTarget);
  field.handles = await field.store.toList();
  //console.log(field.handles);
  field.handles.forEach(async handle => addHandle(storage, field, handle));
};

const addHandle = async (storage, parent, handle) => {
  const id = snarfId(handle.storageKey);
  const tags = (handle.tags || []).join('-');
  const store = await storage.connect(`id${Math.random()}`, handle.type, handle.storageKey);
  const data = store.toList ? await store.toList() : await store.get();
  const field = {id, store, data, parent};
  parent.fields.push(field);
  store.on('change', info => onHandleChange(field, info), eventTarget);
  const boxid = `${tags}|${id}|from|${parent.ownerid}|${parent.id}`;
  console.log(`add [${boxid}]`);
};

export {addUser};
