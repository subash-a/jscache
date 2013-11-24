function Cache () {
    'use strict';
    var CACHE = {},
    table = {},
    size = 0,
    max_size = 0,
    cache_obj = {},
    clearCache = function () {
	table = [];
    },
    checkCache = function(id,callback) {
	if(table[id]) {
	    callback(table[id]);
	}
	else {
	    table[id] = getObject(id,callback);
	}
    },
    getCacheObject = function (id,callback) {
	return checkCache(id,callback);
    },
    setCacheObject = function (id,obj) {
	table[id] = obj;
	return CACHE;
    },
    calculateSize = function () {
	size = getSize(table);
    },
    getCacheSize = function () {
	calculateSize();
	return size;
    },
    setMaximumCacheSize = function (s) {
	max_size = s;
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
    getObject = function (id,callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET",id,true);
	xhr.onreadystatechange = function () {
	    if(xhr.readyState === 4) {
		table[id] = JSON.parse(xhr.responseText);
		callback(table[id]);
	    }
	};
	xhr.send();
    };
    
    //=====================================================================
    //         Setting public variables and methods
    //====================================================================
    CACHE.clearCache = clearCache;
    CACHE.getCacheObject = getCacheObject;
    CACHE.setCacheObject = setCacheObject;
    CACHE.getCacheSize = getCacheSize;
    CACHE.setMaximumCacheSize = setMaximumCacheSize;
    return CACHE;
}
 

