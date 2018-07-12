import {Arc} from '../arcs/runtime/arc.js';
//import {Description} from '../arcs/runtime/description.js';
import {Manifest} from '../arcs/runtime/manifest.js';
//import {Planificator} from '../arcs/runtime/planificator.js';
import {Planner} from '../arcs/runtime/planner.js';
//import {SlotComposer} from '../arcs/runtime/slot-composer.js';
//import {DomSlot} from '../arcs/runtime/dom-slot.js';
//import {Type} from '../arcs/runtime/type.js';
import {BrowserLoader} from './browser-loader.js';
//import {Loader} from '../arcs/runtime/loader.js';
//import {Tracing} from '../arcs/tracelib/trace.js';
import {MockSlotComposer} from '../arcs/runtime/testing/mock-slot-composer.js';
import {MessageChannel} from '../arcs/runtime/message-channel.js';
import {ParticleExecutionContext} from '../arcs/runtime/particle-execution-context.js';

const LoaderKind = BrowserLoader;
//const LoaderKind = Loader;
const loader = new LoaderKind({
  'https://$shell/': 'http://localhost/projects/arcs/arcs/',
  'https://sjmiles.github.io/': 'http://localhost/projects/arcs/'
});

//console.log(loader);
const slotComposer = new MockSlotComposer();
//console.log(slotComposer);
const pecFactory = function(id) {
  let channel = new MessageChannel();
  new ParticleExecutionContext(channel.port1, `${id}:inner`, loader);
  return channel.port2;
};
//console.log(pecFactory);

const arcsPath = '../arcs';

const content = `
//import '${arcsPath}/artifacts/Arcs/Arcs.recipes'
//import '${arcsPath}/artifacts/canonical.manifest'
//import 'https://sjmiles.github.io/arcs-stories/0.4/Generic/Generic.recipes'
//import 'https://sjmiles.github.io/arcs-stories/0.4/TV/TV.recipes'
import 'https://sjmiles.github.io/arcs-stories/0.4/PlaidAccounts/PlaidAccounts.recipes'
//import 'https://sjmiles.github.io/arcs-stories/0.4/GitHubDash/GitHubDash.recipes'
//import 'https://sjmiles.github.io/arcs-stories/0.4/Generated/Generated.recipes'`;

const fileName = './in-memory.manifest';
Manifest.parse(content, {loader, fileName}).then(context => {
  //console.log(context);
  const params = {
    id: `server-arc`,
    pecFactory,
    slotComposer,
    loader,
    context,
    storageKey: null
  };
  const arc = new Arc(params);
  //console.log(!!arc, !!arc.pec, !!arc.pec.slotComposer);
  // TODO(sjmiles): no analog in shell?
  slotComposer.pec = arc.pec;
  //
  //createPlanificator(arc);
  const planner = createPlanner(arc);
  emitPlans(planner);
});

const createPlanner = arc => {
  const planner = new Planner();
  planner.init(arc);
  return planner;
};

const emitPlans = async planner => {
  const metaplans = await planner.suggest();
  console.log(metaplans.length);
  metaplans.forEach(metaplan => {
    const {plan} = metaplan;
    if (plan) {
      console.log('=================================');
      plan.particles && plan.particles.forEach(particle => console.log(particle.spec.toString()));
      console.log('');
      console.log(plan.toString());
      console.log('=================================');
    }
  });
};
