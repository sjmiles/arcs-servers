import {StorageProviderFactory} from '../../arcs/runtime/ts-build/storage/storage-provider-factory.js';
import {addUser} from './context.js';
//import {Manifest} from '../../arcs/runtime/manifest.js';
//import {Planner} from '../../arcs/runtime/planner.js';
//import {ArcFactory} from './arc-factory-node.js';

// init dependencies

const fileName = './in-memory.manifest';
const content = `
  import 'https://$artifacts/canonical.manifest'
  //import 'https://$artifacts/Arcs/Arcs.recipes'
`;

const context = () => {
  const providerFactory = new StorageProviderFactory('shell');
  const user = {
    id: `-L8ZV2_gCxnL4SSz-16`,
    arcs: [
      `firebase://arcs-storage.firebaseio.com/AIzaSyBme42moeI-2k8WgXh-6YK_wYyjEXo4Oz8/0_4_1-alpha/arcs/-LM4CQVw-IND53H2q4i7`
    ]
  };
  addUser(providerFactory, user);
};

context();

const plan = () => {
  const arcFactory = new ArcFactory();
  Manifest.parse(content, {loader: arcFactory.loader, fileName}).then(context => {
    const arc = arcFactory.spawn(context);
    const planner = createPlanner(arc);
    emitPlans(planner);
  });
};

const createPlanner = arc => {
  const planner = new Planner();
  planner.init(arc);
  return planner;
};

const emitPlans = async planner => {
  console.log('');
  console.log('=================================');
  const metaplans = await planner.suggest();
  console.log('Plan count: ', metaplans.length);
  console.log('---------------------------------');
  console.log('');
  metaplans.forEach(metaplan => {
    console.log(metaplan.descriptionText);
    console.log('');
    // const {plan} = metaplan;
    // if (plan) {
    //   debugger;
    //   plan.particles && plan.particles.forEach(particle => console.log(particle.spec.toString()));
    //   console.log('');
    //   //console.log(plan.toString());
    //   console.log(plan);
    // }
  });
  console.log('=================================');
};

