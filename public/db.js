let db;
let budgetVersion;

//Create a new db request for a 'budget' database. requesting db instance
const request = indexedDB.open("BudgetDB", budgetVersion || 1);

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
    // checkDB();
  }
};

request.onerror = (ev) => {
  console.log(`Woops! ${ev.target.errorCode}`);
};
