function Cache () {
    'use strict';
    var CACHE = {},
    table = {},
    size = 0,
    max_size = 0,
    cache_obj = Object.create({"size":0,"data":{}}),
    clearCache = function () {
	table = [];
    },
    checkCache = function(id,callback) {
	if(table[id]) {
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
    getSize = function(list) {
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
	for(var x in list) {
	    checkSize(list[x])
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
		table[id] = Object.create(cache_obj);
		table[id].data = JSON.parse(xhr.responseText);
		table[id].size = getCacheObjectSize(id);
		size += table[id].size;
		callback(table[id].data);
		}
	    };
	xhr.send();
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
 

