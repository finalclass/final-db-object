///<reference path="../types/types-client.d.ts"/>
///<reference path="FDBOEvent.ts"/>
///<reference path="FinalDBObject.ts"/>

class FDBOChildAddedEvent extends FDBOEvent {

  constructor(t:string, private child:FinalDBObject) {
    super(t);
  }

}