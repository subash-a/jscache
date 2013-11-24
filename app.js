function start_cache() {
    var cache1 = new Cache();
    cache1.setMaximumCacheSize(1024);
    cache1.getCacheObject("data/simple.json",function(o){
	console.log(cache1.getCacheSize());
	if ( cache1.getCacheSize() > 100 ) {
	    console.log("Size exceeds 100B");
	}

    });
    cache1.getCacheObject("data/complex.json",function(o){
	console.log(cache1.getCacheSize());
	if ( cache1.getCacheSize() > 100 ) {
	    console.log("Size exceeds 100B");
	}
    });
}