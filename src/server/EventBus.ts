///<reference path="../types/types-server.d.ts"/>

import events = require('events');

class EventBus extends events.EventEmitter {

  constructor() {
    super();
  }

}

export = EventBus;