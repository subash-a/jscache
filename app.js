function start_cache() {
    var cache1 = new Cache();
    cache1.setMaximumCacheSize(149);
    cache1.getCacheObject("data/simple.json",function(o){
	console.log(cache1.getCacheSize());
    });
    cache1.getCacheObject("data/complex.json",function(o){
	console.log(cache1.getCacheSize());
    });
}