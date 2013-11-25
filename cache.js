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
    cache_obj = Object.create({"size":0,"data":{},"fetched":1,"last_fetched":null});
    
    //=======================================================================
    //         Method Declarations and Definitions
    //======================================================================
/**
This method is used to clear the cache table and empty it in one go.

@method clearCache
**/
    var clearCache = function () {
	table = {};
    },
/**
Method is used for checking the cache and firing a ajax call if the data for that hash id is not found in the cache. It also has the task of updating the cache statistics and cacheObject statistics when the object is found in the cache. It also does the special function of queueing requests for a particular cache object if the id has already been sent via an AJAX request and once the data returns the callbacks are executed in the order they arrived.

@method checkCache
@param String id is the cache object hash id (URL and params)
@param Function callback is the callback to be exected when the object data is available.
**/
    checkCache = function(id,callback) {
	if(table[id]) {
	    cacheHits ++;
	    updateCacheObjectFlags(id);
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
/**
This method is used for updating cache object flags or statistics so that when the objects are sent for an evaluation by a replacement algorithm their flag values decide whether they will be removed or retained in the cache.

@method updateCacheObjectFlags
@param String id is the hash id of the cacheObject (URL and params)
**/
    updateCacheObjectFlags = function(id) {
	table[id].fetched ++;
	table[id].last_fetched = Date.parse(new Date());
    },
/**
Method is used for fetching cache object and calls another function internally called checkCache which checks and executes the callback on the cacheObject

@method getCacheObject
@param String id is the hash id of the cache object (URL and params)
@return Function checkCache which executes the callback with cacheObject
**/
    getCacheObject = function (id,callback) {
	    return checkCache(id,callback);
    },
/**
The method is used primarily to set a cacheObject manually if one does not want to make a AJAX call via getObject. Must be used in emergency cases only.

@method setCacheObject
@param String id is the hash id of the cache object (URL and params)
@param Object obj is the cache object template which contains flags and data value set to a particular value.
@return Object CACHE is the cache instance which is being set with data.
**/
    setCacheObject = function (id,obj) {
	table[id].data = obj;
	return CACHE;
    },
/**
This method is used for calculating the approximate size of the cache object as a whole along with nseted object structure it returns the size in Bytes. It recursively calculates the size of a nested object.

@method getSize
@param Object obj is the object for which the size needs to be calculated
@return Number s is the size of the object in Bytes
**/
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
/**
 Function calculates the size of a given object by passing it to an other function called getSize. This methos is used in case of any pre processing to be doone on the object or parsing purposes

@method calculateSize
@param Object obj
@return Function getSize which returns the size of the object passed to it
**/
    calculateSize = function (obj) {
	return getSize(obj);
    },
/**
Method returns the size of an individual cache object when passed to it by id.

@method getCacheObjectSize
@param String id is the hash id of the cach object to be used for size calculation
@return Function calculateSize function is used for calculating size of any object after pre processing.
**/
    getCacheObjectSize = function (id) {
	return calculateSize(table[id].data);
    },
/**
This method is used for returning the cacheSize of the overall cache when called. This maintains a size varaible which gets updated when any new object is added to the cache and when any object is removed from the cache

@method getCacheSize
@return Number size in Bytes
**/
    getCacheSize = function () {
	return size;
    },
/**
This method is used for fetching the cache statistics of number of items, minimum number of fetches done for an object, cache hits, cache misses and cache size.

@method getStats
@return Object containing all the above described elements
**/
    getStats = function () {
	return {"items":Object.keys(table).length,"minimum_fetched":minFetched,"cache_size":size,"cache_miss":cacheMisses,"cache_hits":cacheHits};
    },
/**
This method is used for setting the maximum cache size in bytes that can be used and when the cache size is about to exceed, one of the many algorithms comes into play to replace the cahce object based on some criteria.

@method setMaximumCacheSize
@param Number sz is the size based on which the criteria is chosen
@return Object CACHE is the instance of this object
**/
    setMaximumCacheSize = function (sz) {
	maxCacheSize = sz;
	return CACHE;
    },
    executeCallbackQueue = function(id) {
	
    },
/**
Method is used for fetching the required data from the backend or a web service using AJAX call and is then used for executing the callback passed to the cacheObject, it also executes the callbacks which have been queued after the ajax call was made and before it returned with the data.

@method getObject
@param String id is the hash Cache Object id (URL with params)
@param Function callback is a callback function which gets executed once data is available
**/
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
			updateCacheObjectFlags(id);
			f.apply(this,obj)
		    });
		}
	    }
	}
	xhr.send();
    },
/**
 This method is used for removing a cacheObject based on the id passed to it.

@method removeCacheObject
@param String id is the hash id of the cacheObject (URL with params)
**/
    removeCacheObject = function(id) {
	size -= table[id].size;
	delete table[id];
	console.log("removed cache object",id);
    },
/**
 Method is used for creating a template cache object and then adding data returned to it from the ajax call and then setting up its size and checks for Cahce memory overflow. If overflow then warning is given and then a particular algorithm is executed to balance the memory. After this balancing operation cacheObject is added to the cache and is returned as well.

@method addCacheObject
@param String id this is the hash id of the object (URL with params)
@param Object data this is the data that has been returned from the ajax call.
@return Object cacheObject is the fully formed object that contains flag data and the ajax data.
**/
    addCacheObject = function (id,data) {
	var cacheObject = {"size":0,"data":{},"fetched":1,"last_fetched":Date.parse(new Date())};
	cacheObject.data = data;
	cacheObject.size = getSize(cacheObject);
	if((size + cacheObject.size) > maxCacheSize) {
	    var overflow = maxCacheSize - (size + cacheObject.size);
	    console.log("Cache Size will be exceeded by: " + Math.abs(overflow) + " Bytes");
	    //removeLeastFetched(cacheObject.size);
	}
	size += cacheObject.size;
	minFetched = minFetched > cacheObject.fetched ? minFetched : cacheObject.fetched;
	table[id] = cacheObject;
	return cacheObject;
    },
    removeLeastFetched = function (o_size) {
	var obj_id,
	min_fetch = minFetched;
	for(var o in table) {
	    if(table[o].fetched <= min_fetch) {
		min_fetch = table[o].fetched;
		obj_id = o;
	    }
	}
	removeCacheObject(obj_id);

    },
    removeLeastUsed = function (o_size) {
	var obj_id,
	rare_fetch = Date.parse(new Date());
	for(var o in table) {
	    if(table[o].last_fetched <= rare_fetch) {
		rare_fetch = table[o].last_fetched;
		obj_id = o;
	    }
	}
	removeCacheObject(obj_id);
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
 

