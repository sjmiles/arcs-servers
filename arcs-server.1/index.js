//import {Arc} from '../../arcs/runtime/arc.js';
//import {Description} from '../../arcs/runtime/description.js';
import {Manifest} from '../../arcs/runtime/manifest.js';
//import {Planificator} from '../../arcs/runtime/planificator.js';
import {Planner} from '../../arcs/runtime/planner.js';
//import {SlotComposer} from '../../arcs/runtime/slot-composer.js';
//import {DomSlot} from '../../arcs/runtime/dom-slot.js';
//import {Type} from '../../arcs/runtime/type.js';
//import {BrowserLoader} from './browser-loader.js';
//import {Loader} from '../../arcs/runtime/loader.js';
//import {Tracing} from '../../arcs/tracelib/trace.js';
//import {MockSlotComposer} from '../../arcs/runtime/testing/mock-slot-composer.js';
//import {MessageChannel} from '../../arcs/runtime/message-channel.js';
//import {ParticleExecutionContext} from '../../arcs/runtime/particle-execution-context.js';
import {StorageProviderFactory} from '../../arcs/runtime/ts-build/storage/storage-provider-factory.js';
import {ArcFactory} from './arc-factory-node.js';
import {addUser} from './context.js';

// init dependencies

const fileName = './in-memory.manifest';
const content = `
  import 'https://$artifacts/canonical.manifest'
  //import 'https://$artifacts/Arcs/Arcs.recipes'
  //import 'https://$artifacts/List/List.recipes'
  //import 'https://sjmiles.github.io/arcs-stories/0.4/Generic/Generic.recipes'
  //import 'https://sjmiles.github.io/arcs-stories/0.4/TV/TV.recipes'
  //import 'https://sjmiles.github.io/arcs-stories/0.4/PlaidAccounts/PlaidAccounts.recipes'
  //import 'https://sjmiles.github.io/arcs-stories/0.4/GitHubDash/GitHubDash.recipes'
  //import 'https://sjmiles.github.io/arcs-stories/0.4/Generated/Generated.recipes'
`;

const providerFactory = new StorageProviderFactory('shell');
addUser(providerFactory, null);

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

