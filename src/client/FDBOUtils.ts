class FDBOUtils {

  public static getParentPath(path) : string {
    var parts:string[] = path.segment();
    parts.pop();
    return parts.join('/');
  }

}