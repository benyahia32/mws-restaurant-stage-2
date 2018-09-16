/**
 * idb.
 */
var idbApp = (function() {
  'use strict';

  // check for indexedDB support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  // open database
  var dbPromise = idb.open('restaurant-review', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
          // nothing needs to be done here
      case 1:
        console.log('Creating the restaurant review object store');
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
    }
  });

  // add restaurants to database
  function addRestaurants() {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(function(restaurants) {
      console.log('successfully pulled restaurants json data')
      // now cache it
      dbPromise.then( (db) => {
        let restaurantValStore = db.transaction('restaurants', 'readwrite').objectStore('restaurants')
          for (const restaurant of restaurants) {
            restaurantValStore.put(restaurant)
          }
      })
      // now return it
        callback(null, restaurants);
      }).catch(function (err) {
        dbPromise.then( (db) => {
          let restaurantValStore = db.transaction('restaurants').objectStore('restaurants')
          return restaurantValStore.getAll();
      })
    })
  }

  // get restaurant by id
  function getByID(id) {
    return dbPromise.then(function(db) {
      const tx = db.transaction('restaurants', 'readonly');
      const store = tx.objectStore('restaurants');
      return store.get(parseInt(id));
      }).then(function(restaurantObject) {
        return restaurantObject;
      }).catch(function(e) {
      console.log("idbApp.fetchRestaurantById errored out:", e);
    });
  }

  // get all restaurants
  function getAll() {
  dbPromise.then(db => {
    return db.transaction('restaurants')
      .objectStore('restaurants').getAll();
  }).then(allObjs => console.log(allObjs));
  }

  // return promises
  return {
    dbPromise: (dbPromise),
    addRestaurants: (addRestaurants),
    getByID: (getByID),
    getAll: (getAll)
  };
})();

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // attempt to get restaurants from indexedDB
    idbApp.addRestaurants(callback);
    // if no restaurants, get them from the server
    if (!restaurants) {
      fetch(DBHelper.DATABASE_URL)
      .then(function(response) {
        // fetch from URL
        return response.json();
      }).then(function(returnRestaurants) {
        // take the response and get an array of restaurants
        const restaurants = returnRestaurants;
        callback(null, restaurants);
        //if everything good, return restaurants
      })
      .catch(function(error) {
        callback(error, null);
        //if fails send the error back.
      })
  }
  };

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    const restaurant = idbApp.getByID(id);
    restaurant.then(function(restaurantObject) {
      if (restaurantObject) {
        console.log("GC: fetchRestaurantById from IndexedDB");
        callback(null, restaurantObject);
        return;
      }
      else {
        DBHelper.fetchRestaurants((error, restaurants) => {
          if (error) {
            callback(error, null);
          } else {
            const restaurant = restaurants.find(r => r.id == id);
            if (restaurant) { // Got the restaurant
              // console.log("idbMessages", idbMessages);
              console.log("GC: fetchRestaurantById from network");
              callback(null, restaurant);
            } else { // Restaurant does not exist in the database
              callback('Restaurant does not exist', null);
            }
          }
        });
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          const results = restaurants.filter(r => r.cuisine_type == cuisine);
          callback(null, results);
        }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          callback(null, results);
        }
      });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          let results = restaurants
          if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          callback(null, results);
        }
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        }
      });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        }
     });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  static imageSetUrlForRestaurant(restaurant) {
      return (`/images/${restaurant.id}-1600_large.jpg 1200w, /images/${restaurant.id}-800_medium.jpg 800w, /images/${restaurant.id}-400_small.jpg 400w` );
  }

/**
   * Restaurant image alt.
   */
  static imageAltForRestaurant(restaurant) {
    let shortDesc = ["classical indoor decoration",
                 "enjoy large mozzarella pizzas",
                 "large mozzarella pizza",
                 "beautiful entrance at street corner",
                 "cool open kitchen",
                 "classical American dinying room with flag",
                 "two men wating at thec cosy entrance",
                 "classical european atmosphere",
                 "busy but relaxed ambiance",
                 "tidy and clean"
         ]

    return (`${restaurant.name} restaurant, ${shortDesc[restaurant.id-1]}`);
  }


  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      keyboard: false
      })
      marker.addTo(newMap);
    return marker;
  }

}
