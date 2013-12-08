function start_cache() {
    var cache1 = new Cache();
    //cache1.log(true);
    cache1.getCacheObject("data/xxxl.json",function(data){console.log(data)});
    cache1.getCacheObject("data/xxxl.json",function(data){console.log(data)});
    /*cache1.getCacheObject("data/xxl.json",function(){});
    cache1.getCacheObject("data/xl.json",function(){});
    cache1.getCacheObject("data/large.json",function(){});
    cache1.getCacheObject("data/medium.json",function(){});
    cache1.getCacheObject("data/small.json",function(){});*/
    //cache1.chunkData();
    //cache1.getChunkedCacheObject("data/chunk.json",function(data){console.log(data)},{"urltemplate":"data/chunk{value}.json","keyarray":[1,2,3,4],"interval":0,"path":"set"});
    //cache1.getChunkedCacheObject("data/chunk.json",function(data){console.log("new call",data)},{"urltemplate":"data/chunk{value}.json","keyarray":[1,2,3,4],"interval":0,"path":"set"});
}
