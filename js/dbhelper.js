/**
 * idb.
 */
const idbApp = (function() {
  'use strict';
  
   const dbPromise = idb.open('restaurantreviews', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', {
          keyPath: 'id'
        });
    }
  });

   function addRestaurantById(restaurant) {
    return dbPromise.then(function(db) {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      store.put(restaurant);
      return tx.complete;
    }).catch(function(error) {
      // tx.abort();
      console.log("Unable to add restaurant to IndexedDB", error);
    });
  }

  function fetchRestaurantById(id) {
    return dbPromise.then(function(db) {
      const tx = db.transaction('restaurants');
      const store = tx.objectStore('restaurants');
      return store.get(parseInt(id));
    }).then(function(restaurantObject) {
      return restaurantObject;
    }).catch(function(e) {
      console.log("idbApp.fetchRestaurantById errored out:", e);
    });
  }

   return {
    dbPromise: (dbPromise),
    addRestaurantById: (addRestaurantById),
    fetchRestaurantById: (fetchRestaurantById),
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
   fetch(DBHelper.DATABASE_URL)
    .then(response => response.json())
    .then(function(jsonResponse) {
      callback(null, jsonResponse);
    })
    .catch(function(error) {
      const errorMessage = (`Request failed. Returned status of ${error}`);
      callback(errorMessage, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    const idbRestaurant = idbApp.fetchRestaurantById(id);
    idbRestaurant.then(function(idbRestaurantObject) {
      if (idbRestaurantObject) {
        console.log("GC: fetchRestaurantById from IndexedDB");
        callback(null, idbRestaurantObject);
        return;
      }
      else {
        DBHelper.fetchRestaurants((error, restaurants) => {
          if (error) {
            callback(error, null);
          } else {
            const restaurant = restaurants.find(r => r.id == id);
            if (restaurant) { // Got the restaurant
              let idbMessages = idbApp.addRestaurantById(restaurant); // adding restaurant to IndexedDB
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
