///<reference path="./types/types.d.ts"/>

import events = require('events');

class EventBus extends events.EventEmitter {

  constructor() {
    super();
  }

}

export = EventBus;