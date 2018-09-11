import '../../arcs/shell/bulid/ArcsLib.js';
import Arcs from '../../arcs/shell/app-shell/lib/arcs.js';
import {ArcFactory} from './arc-factory.js';

// init dependencies

const arcFactory = new ArcFactory();

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

Manifest.parse(content, {loader: arcFactory.loader, fileName}).then(context => {
  const arc = arcFactory.spawn(context);
  //
  studyHandles(arc);
  //
  //const planner = createPlanner(arc);
  //emitPlans(planner);
});

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

const studyHandles = async (arc) => {
  const fbKey = `firebase://arcs-storage.firebaseio.com/AIzaSyBme42moeI-2k8WgXh-6YK_wYyjEXo4Oz8/0_4_1-alpha/arcs/-LM3zxu0HJrtUMcVhzNB`;
  const handleStore = await arc._storageProviderFactory.connect(`some-id`, null, `synthetic://arc/handles/${fbKey}`);
  const handles = await handleStore.toList();
  console.log(handles);
};
