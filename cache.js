function Cache () {
    'use strict';
    var CACHE = {},
    table = {},
    size = 0,
    max_size = 0,
    min_fetched = 0,
    cache_obj = Object.create({"size":0,"data":{},"fetched":1}),
    clearCache = function () {
	table = [];
    },
    checkCache = function(id,callback) {
	if(table[id]) {
	    table[id].fetched ++;
	    callback(table[id].data);
	}
	else {
	    getObject(id,callback);
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
	var s = 0,
	checkSize = function(o){
	    switch (typeof o) {
	    case 'string': s += o.length * 2;
		break;
	    case 'number': s += 8;
		break;
	    case 'boolean': s += 4;
		break;
	    case 'object': for(var c in o){
		checkSize(o[c]);
	    };
		break;
	    default : s += 1;
		break;
	    };
	};
	for(var x in obj) {
	    checkSize(obj[x])
	}
	return s;
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
    setMaximumCacheSize = function (s) {
	max_size = s;
	return CACHE;
    },
    getObject = function (id,callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET",id,true);
	xhr.onreadystatechange = function () {
	    if(xhr.readyState === 4) {
		var data = JSON.parse(xhr.responseText);
		var obj = addCacheObject(id,data);
		callback(obj);
	    }
	}
	xhr.send();
    },
    removeCacheObject = function(id) {
	delete table[id];
    },
    addCacheObject = function (id,data) {
	var cacheObject = {"size":0,"data":{},"fetched":1};
	cacheObject.data = data;
	cacheObject.size = getSize(cacheObject);
	if((size + cacheObject.size) > max_size) {
	    var overflow = max_size - (size + cacheObject.size);
	    console.log("Cache Size will be exceeded by: " + Math.abs(overflow) + " Bytes");
	    removeLeastUsed(cacheObject.size);
	}
	size += cacheObject.size;
	min_fetched = min_fetched > cacheObject.fetched ? min_fetched : cacheObject.fetched;
	table[id] = cacheObject;
	return cacheObject;
    },
    removeLeastUsed = function (o_size) {
	for(var o in table) {
	    if(table[o].fetched < min_fetched) {
		size -= table[o].size;
		removeCacheObject(o);
	    }
	}
    };
	
    //=====================================================================
    //         Setting public variables and methods
    //====================================================================
    CACHE.maxSize = max_size;
    
    CACHE.clearCache = clearCache;
    CACHE.getCacheObject = getCacheObject;
    CACHE.setCacheObject = setCacheObject;
    CACHE.getCacheSize = getCacheSize;
    CACHE.setMaximumCacheSize = setMaximumCacheSize;
    
    return CACHE;
}
 

