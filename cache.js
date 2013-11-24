function Cache () {
    'use strict';
    //===================================================================
    //                 Variable Declarations and Initializations
    //===================================================================
    var CACHE = {},
    table = {},
    queue = [],
    callback_queue = {},
    size = 0,
    maxCacheSize = 0,
    minFetched = 0,
    cacheMisses = 0,
    cacheHits = 0,
    cache_obj = Object.create({"size":0,"data":{},"fetched":1});
    
    //=======================================================================
    //         Method Declarations and Definitions
    //======================================================================
    var clearCache = function () {
	table = [];
    },
    checkCache = function(id,callback) {
	if(table[id]) {
	    table[id].fetched ++;
	    cacheHits ++;
	    callback(table[id].data);
	}
	else {
	    if(!callback_queue[id]) {
		callback_queue[id] = [];
		cacheMisses ++;
		getObject(id,callback);
	    }
	    else {
		callback_queue[id].push(callback); 
	    }
	}
    },
    getCacheObject = function (id,callback) {
	    return checkCache(id,callback);
    },
    setCacheObject = function (id,obj) {
	table[id].data = obj;
	return CACHE;
    },
    getSize = function(obj) {
	var sum = 0,
	checkSize = function(o){
	    switch (typeof o) {
	    case 'string': sum += o.length * 2;
		break;
	    case 'number': sum += 8;
		break;
	    case 'boolean': sum += 4;
		break;
	    case 'object': for(var c in o){
		checkSize(o[c]);
	    };
		break;
	    default : sum += 1;
		break;
	    };
	};
	for(var x in obj) {
	    checkSize(obj[x])
	}
	return sum;
    },
    calculateSize = function (obj) {
	return getSize(obj);
    },
    getCacheObjectSize = function (id) {
	return calculateSize(table[id].data);
    },
    getCacheSize = function () {
	return size;
    },
    getStats = function () {
	return {"items":Object.keys(table).length,"minimum_fetched":minFetched,"cache_size":size,"cache_miss":cacheMisses,"cache_hits":cacheHits};
    },
    setMaximumCacheSize = function (sz) {
	maxCacheSize = sz;
	return CACHE;
    },
    executeCallbackQueue = function(id) {
	
    },
    getObject = function (id,callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET",id,true);
	xhr.onreadystatechange = function () {
	    if(xhr.readyState === 4) {
		var data = JSON.parse(xhr.responseText);
		var obj = addCacheObject(id,data);
		callback(obj);
		if(callback_queue[id].length) { 
		    callback_queue[id].map(function(f){
			cacheHits ++;
			table[id].fetched ++;
			f.apply(this,obj)
		    });
		}
	    }
	}
	xhr.send();
    },
    removeCacheObject = function(id) {
	delete table[id];
	console.log("removed cache object",id);
    },
    addCacheObject = function (id,data) {
	var cacheObject = {"size":0,"data":{},"fetched":1};
	cacheObject.data = data;
	cacheObject.size = getSize(cacheObject);
	if((size + cacheObject.size) > maxCacheSize) {
	    var overflow = maxCacheSize - (size + cacheObject.size);
	    console.log("Cache Size will be exceeded by: " + Math.abs(overflow) + " Bytes");
	    removeLeastUsed(cacheObject.size);
	}
	size += cacheObject.size;
	minFetched = minFetched > cacheObject.fetched ? minFetched : cacheObject.fetched;
	table[id] = cacheObject;
	return cacheObject;
    },
    removeLeastUsed = function (o_size) {
	for(var o in table) {
	    if(table[o].fetched <= minFetched) {
		size -= table[o].size;
		removeCacheObject(o);
	    }
	}
    };
	
    //=====================================================================
    //         Setting public variables and methods
    //====================================================================
    CACHE.maxSize = maxCacheSize;
    
    CACHE.getStats = getStats;
    CACHE.clearCache = clearCache;
    CACHE.getCacheObject = getCacheObject;
    CACHE.setCacheObject = setCacheObject;
    CACHE.getCacheSize = getCacheSize;
    CACHE.setMaximumCacheSize = setMaximumCacheSize;
    
    return CACHE;
}
 

