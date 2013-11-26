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
    log = false,
    debug = false,
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
	if(log){console.log("Cache Table Cleared")}
	table = {},
	queue = [],
	callback_queue = {},
	size = 0,
	minFetched = 0,
	cacheMisses = 0,
	cacheHits = 0,
	cache_obj = Object.create({"size":0,"data":{},"fetched":1,"last_fetched":null});
    },
/**
Method is used for checking the cache and firing a ajax call if the data for that hash id is not found in the cache. It also has the task of updating the cache statistics and cacheObject statistics when the object is found in the cache. It also does the special function of queueing requests for a particular cache object if the id has already been sent via an AJAX request and once the data returns the callbacks are executed in the order they arrived.

@method checkCache
@param String id is the cache object hash id (URL and params)
@param Function callback is the callback to be exected when the object data is available.
**/
    checkCache = function(id,callback) {
	if(table[id]) {
	    if(log){console.log("Data found in Cache Table")}
	    cacheHits ++;
	    updateCacheObjectFlags(id);
	    callback(table[id].data);
	}
	else {
	    if(log){console.log("Data not found in Cache Table")}
	    if(!callback_queue[id]) {
		callback_queue[id] = [];
		cacheMisses ++;
		getObject(id,callback);
	    }
	    else {
		if(log){console.log("Pushing request into Callback Queue")}
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
	if(log){console.log("Updating Cache Object flags")}
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
	if(log){console.log("Checking for requested Cache Object")}
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
	if(log){console.log("Setting Cache Object through manual feed")}
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
	if(log){console.log("Calculating Size of the Object")}
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
This method sets logging as true or false

@method setLogging
@param Boolean l is the log flag either true or false
**/
    setLogging = function(l){
	log = l;
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
	if(log){console.log("Setting Maximum Cache Size")}
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
	if(log){console.log("Sending AJAX request to fetch requested data")}
	var xhr = new XMLHttpRequest();
	xhr.open("GET",id,true);
	xhr.onreadystatechange = function () {
	    if(xhr.readyState === 4) {
		var data = JSON.parse(xhr.responseText);
		var obj = addCacheObject(id,data);
		callback(obj);
		if(callback_queue[id].length) { 
		    if(log){console.log("Starting execution of callback queue")}
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
	if(log){console.log("Removing Cache Object id: ",id)}
	size -= table[id].size;
	delete table[id];
	
    },
/**
 Method is used for creating a template cache object and then adding data returned to it from the ajax call and then setting up its size and checks for Cahce memory overflow. If overflow then warning is given and then a particular algorithm is executed to balance the memory. After this balancing operation cacheObject is added to the cache and is returned as well.

@method addCacheObject
@param String id this is the hash id of the object (URL with params)
@param Object data this is the data that has been returned from the ajax call.
@return Object cacheObject is the fully formed object that contains flag data and the ajax data.
**/
    addCacheObject = function (id,data) {
	if(log){console.log("Adding new cache object to the Cache Table")}
	var cacheObject = {"size":0,"data":{},"fetched":1,"last_fetched":Date.parse(new Date())};
	cacheObject.data = data;
	cacheObject.size = getSize(cacheObject);
	if((size + cacheObject.size) > maxCacheSize) {
	    var overflow = maxCacheSize - (size + cacheObject.size);
	    if(log){console.warn("Cache Size will be exceeded by: " + Math.abs(overflow) + " Bytes")}
	    //removeLeastFetched(cacheObject.size);
	}
	size += cacheObject.size;
	minFetched = minFetched > cacheObject.fetched ? minFetched : cacheObject.fetched;
	table[id] = cacheObject;
	return cacheObject;
    },
/**
This is a Object replacement algorithm that removes any object that has been fetched the least so that new objects can take its place and cache is made useful and efficient.

@method removeLeastFetched
@param Number o_size is the size of the object that needs to be added to cache so that replacement of one or more cache objects can be carried out till the required size is freed in the cache
**/
    removeLeastFetched = function (o_size) {
	if(log){console.log("Calling remove least fetched algoritm")}
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
/**
This Cache Object replacement algorithm replaces objects by criterion as to which was the object that was fetched very long ago and has not been fetched again. All cache objects are updated with the latest fetch time and the oldest one is replaced.

@method removeLeastUsed
@param Number o_size is the size of the object that needs to be added to the cache
**/
    removeLeastUsed = function (o_size) {
	if(log){console.log("calling remove least used algorithm")}
	var obj_id,
	rare_fetch = Date.parse(new Date());
	for(var o in table) {
	    if(table[o].last_fetched <= rare_fetch) {
		rare_fetch = table[o].last_fetched;
		obj_id = o;
	    }
	}
	removeCacheObject(obj_id);
    },
/**
This replacement algorithm reoves the biggest cache object to make way for many smaller objects, it needs to be used in conjunction with the least used algorithm fir best results

@method removeBiggest
@param Number o_size is the size of the object that needs to be added into the cache.
**/
    removeBiggest = function (o_size) {
	if(log){console.log("calling remove biggest algorithm")}
	var obj_id,
	biggest_size = 0;
	for(var o in table) {
	    if(table[o].size > biggest_size) {
		biggest_size = table[o].size;
		obj_id = o;
	    }
	}
	removeCacheObject(obj_id);
    },

    removeSmallest = function (o_size) {
	if(log){console.log("calling remove smallest algorithm")}
	var obj_id,
	smallest_size = Infinity;
	if(table[o].size < smallest_size) {
	    smallest_size = table[o].size;
	    obj_id = o;
	}
	removeCacheObject(obj_id);
    };
	
    //=====================================================================
    //         Setting public variables and methods
    //====================================================================
    CACHE.maxSize = maxCacheSize;
    
    CACHE.log = setLogging;
    CACHE.getStats = getStats;
    CACHE.clearCache = clearCache;
    CACHE.getCacheObject = getCacheObject;
    CACHE.setCacheObject = setCacheObject;
    CACHE.getCacheSize = getCacheSize;
    CACHE.setMaximumCacheSize = setMaximumCacheSize;
    
    return CACHE;
}
 

