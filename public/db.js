let db;

//Create a new db request for a 'budget' database. requesting db instance
const request = indexedDB.open("BudgetDB", 3);

//Create schema
request.onupgradeneeded = (ev) => {
  console.log("Upgrade needed in indexDB");

  const { oldVersion } = ev;
  const newVersion = ev.newVersion || db.version;

  console.log(`DB updated from version ${oldVersion} to ${newVersion}`);

  db = ev.target.result;

  // Create an object store inside the onupgradeneeded method.
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

//on success console log the result
request.onsuccess = (ev) => {
  console.log("success");
  db = ev.target.result;
  console.log(db);

  //check if application is online before reading from db
  if (navigator.onLine) {
    console.log("backend is online");
    checkDatabase();
  }
};

//error handling
request.onerror = (ev) => {
  console.log(`Woops! ${ev.target.errorCode}`);
};

//checking indexeddb to see if there are any values to be added to main db once network is back online
const checkDatabase = () => {
  console.log("check db invoked");

  //Open a transaction to the BudgetStore
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  // access your BudgetStore object
  const store = transaction.objectStore("BudgetStore");

  //Get All records from store and set to a variable
  const getAll = store.getAll();

  //if the request was successful
  getAll.onsuccess = function () {
    //if there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          //if our returned response is not empty
          if (res.length !== 0) {
            //Open another transaction to BudgetStore with the ability to read and write
            const transaction = db.transaction(["BudgetStore"], "readwrite");

            //Assign the current store to the variable
            const store = transaction.objectStore("BudgetStore");

            //Clear the existing entries because our bulk add was successful
            store.clear();
            console.log("Clearing store");
          }
        });
    }
  };
};

const saveRecord = (record) => {
  console.log("record saved");
  //create a transaction in the BudgetStore db with readwrite access
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  //access the BudgetStore
  const store = transaction.objectStore("BudgetStore");

  //add record to your store with add method
  store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
