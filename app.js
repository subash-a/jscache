function start_cache() {
    var cache1 = new Cache();
    cache1.setMaximumCacheSize(147);
    for(var i = 0; i < 20; i++) {
	cache1.getCacheObject("data/simple.json",function(o){
	    console.log("Cache Size: ",cache1.getCacheSize());
	});
    }
    for(var j = 0; j < 19; j++) {
	cache1.getCacheObject("data/complex.json",function(o){
	    console.log("Cache Size: ",cache1.getCacheSize());
	});
    }
}