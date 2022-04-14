// Create Variable that will store the connected database object when the connection is complete

let db;

// Establish connection to the IndexedDB database and set it to version 1
const request = indexedDB.open('BudgetKeeper', 1);

// Create Event Listener -> will emit if the db version changes
request.onupgradeneeded = function(event) {
    // Save a reference to the db
    const db = event.target.result;
    // Create an Object Store (table)
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// Upon a successful connection -> finalize the connection to the db
request.onsuccess = function(event) {
    // When db is successfully created with its object store or simply set
    db = event.target.result;
    // Check if App is online, if yes run uploadTransaction function to send all local db data to api
    if (navigator.online) {
        uploadTransaction();
    }
};

// Event Handler to inform if anything ever goes wrong with the db interaction
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Function that will be executed if we attempt to submit a new transaction
function saveRecord(record) {
    // Open a new transaction with the db with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // Access the object store for the 'new_transaction'
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // Add record to your store with the add method
    budgetObjectStore.add(record);
};

// Function to handle collecting data
function uploadTransaction() {
    // Open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // Access the Object Store for the 'new_transaction'
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // GET all records from the store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // Upon a successfull .getAll() execution, run this function
    getAll.onsuccess = function () {
        // If there was data in the indexedDB's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // Open One more Transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // Access the 'new_transaction' object store
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    // Clear all items in your store
                    budgetObjectStore.clear();

                    alert('All saved transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// Listen for the App coming back online
window.addEventListener('online', uploadTransaction);