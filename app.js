function start_cache() {
    var cache1 = new Cache();
    //cache1.log(true);
/*    cache1.getCacheObject("data/xxxl.json",function(){});
    cache1.getCacheObject("data/xxl.json",function(){});
    cache1.getCacheObject("data/xl.json",function(){});
    cache1.getCacheObject("data/large.json",function(){});
    cache1.getCacheObject("data/medium.json",function(){});
    cache1.getCacheObject("data/small.json",function(){});*/
    cache1.chunkData("data/chunk{value}.json",[1,2,3,4],"data/chunk.json",0);
}
