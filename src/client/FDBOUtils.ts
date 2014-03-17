///<reference path="../types/types-client.d.ts"/>

class FDBOUtils {

  public static getParentPath(path:URI) : string {
    var seg = path.segment();
    var clone = path.clone();
    seg.pop();
    clone.segment(seg);
    return clone.toString();
  }

}