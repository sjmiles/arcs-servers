import {Arc} from '../../arcs/runtime/arc.js';
import {BrowserLoader} from './browser-loader.js';
import {MockSlotComposer} from '../../arcs/runtime/testing/mock-slot-composer.js';
import {MessageChannel} from '../../arcs/runtime/message-channel.js';
import {ParticleExecutionContext} from '../../arcs/runtime/particle-execution-context.js';

// TODO(sjmiles): hack to plumb `fetch` into Particle space under node
import {fetch} from '../../arcs/runtime/fetch-node.js';
BrowserLoader.fetch = fetch;

//const LoaderKind = Loader;
const LoaderKind = BrowserLoader;

//const ComposerKind = SlotComposer;
const ComposerKind = MockSlotComposer;

const ArcFactory = class {
  constructor() {
    this.loader = new LoaderKind({
      'https://$cdn/': 'http://localhost/projects/arcs/arcs/',
      'https://$shell/': 'http://localhost/projects/arcs/arcs/',
      'https://$artifacts/': 'http://localhost/projects/arcs/arcs/artifacts/',
      'https://sjmiles.github.io/': 'http://localhost/projects/arcs/'
    });
    //console.log(loader);
    this.slotComposer = new ComposerKind({
      affordance: 'dom'
    });
    //console.log(slotComposer);
    this.pecFactory = function(id) {
      let channel = new MessageChannel();
      new ParticleExecutionContext(channel.port1, `${id}:inner`, this.loader);
      return channel.port2;
    };
    //console.log(pecFactory);
    //const arcsPath = '../../arcs';
    //const arcsURL = 'http://localhost/projects/arcs/arcs';
  }
  spawn(context) {
    const {pecFactory, slotComposer, loader} = this;
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
    return arc;
  }
};

export {ArcFactory};
