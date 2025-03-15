let request = indexedDB.open("UsersDB", 1);

// request.onupgradeneeded = function (event) {
//   let db = event.target.result;

//   let store = db.createObjectStore("users", {
//     keyPath: "id",
//     autoIncrement: true,
//   });

//   store.createIndex("name", "name", { unique: false });
// };

// request.onsuccess = function (event) {
//   let db = event.target.result;

//   loadUsers(db);

//   document.getElementById("addUser").addEventListener("click", function () {
//     let name = document.getElementById("userName").value;
//     if (name) addUser(db, name);
//   });
// };

// request.onerror = function (event) {
//   console.error("❌ خطأ في فتح قاعدة البيانات:", event.target.error);
// };

function addUser(db, name) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.add({ name: name });

  request.onsuccess = function () {
    console.log("success");
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في إضافة المستخدم:", event.target.error);
  };
}

function loadUsers(db) {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");

  let request = store.getAll();

  request.onsuccess = function () {
    let userList = document.getElementById("userList");
    userList.innerHTML = "";

    request.result.forEach((user) => {
      let li = document.createElement("li");
      li.innerHTML = `
                <div>${user.name}</div>
                <div>
                    <button class="update-btn" data-id="${user.id}" data-name="${user.name}">Update</button>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </div>
            `;
      userList.appendChild(li);
    });

    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        let newName = prompt("Enter new name:", btn.dataset.name);
        if (newName) updateUser(db, parseInt(btn.dataset.id), newName);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        deleteUser(db, parseInt(btn.dataset.id));
      });
    });
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في تحميل المستخدمين:", event.target.error);
  };
}

function updateUser(db, id, newName) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.get(id);

  request.onsuccess = function () {
    let user = request.result;
    if (user) {
      user.name = newName;
      let updateRequest = store.put(user);

      updateRequest.onsuccess = function () {
        console.log("🔄 تم تحديث المستخدم:", newName);
        loadUsers(db);
      };

      updateRequest.onerror = function (event) {
        console.error("❌ خطأ في تحديث المستخدم:", event.target.error);
      };
    }
  };
}

function deleteUser(db, id) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.delete(id);

  request.onsuccess = function () {
    console.log("🗑️ تم حذف المستخدم!");
    loadUsers(db);
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في حذف المستخدم:", event.target.error);
  };
}
