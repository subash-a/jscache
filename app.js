function start_cache() {
    var cache1 = new Cache();
    var cache2 = new Cache();
    cache1.getCacheObject("data/simple.json",function(o){console.log(o)});
    cache2.getCacheObject("data/complex.json",function(o){console.log(o)});
}