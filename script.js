let db;

const request = indexedDB.open("DataDb", 1);

request.onerror = (event) => {
  console.error("  لا يمكن فتح قاعدة البيانات:", event.target.error);
};

request.onsuccess = (event) => {
  db = event.target.result;
  add_toPage(db);

  document.getElementById("addUser").addEventListener("click", () => {
    let dbValue = document.getElementById("userName").value.trim();
    if (dbValue) {
      addUser(db, dbValue);
    } else {
      alert("  الرجاء إدخال اسم المستخدم");
    }
  });

  document.getElementById("update-btn").addEventListener("click", function () {
    if (this.dataset.id) {
      update_users(db, parseInt(this.dataset.id));
    }
  });
  setupSearch();
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  let store = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("name", "name", { unique: true });
};

function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      let searchValue = searchInput.value.trim().toLowerCase();
      searchUser(searchValue);
    });
  }
}

function searchUser(searchValue) {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");
  let request = store.getAll();

  request.onsuccess = () => {
    let filteredUsers = request.result.filter((user) =>
      user.name.toLowerCase().includes(searchValue)
    );
    displayUsers(filteredUsers);
  };
}

function addUser(db, name) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.add({ name: name });

  request.onsuccess = function () {
    console.log("  المستخدم تمت إضافته بنجاح!");
    document.getElementById("userName").value = "";
    add_toPage(db);
  };

  request.onerror = function (event) {
    console.error("  خطأ في إضافة المستخدم:", event.target.error);
    alert("  المستخدم موجود بالفعل!");
  };
}

// 🔹 جلب المستخدمين وعرضهم
function add_toPage(db) {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");
  let request = store.getAll();

  request.onsuccess = () => {
    displayUsers(request.result);
  };

  request.onerror = (event) => {
    console.error("  لا يمكن جلب المستخدمين:", event.target.error);
  };
}

function displayUsers(users) {
  let list = document.getElementById("userList");
  list.innerHTML = "";
  users.forEach((user) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <div>${user.name}</div>
      <div>
        <button class="update-btn" data-id="${user.id}" data-name="${user.name}">update</button>
        <button class="delete-btn" data-id="${user.id}">delete</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      delete_users(parseInt(btn.dataset.id));
    });
  });

  document.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      let userId = parseInt(btn.dataset.id);
      let userName = btn.dataset.name;
      document.getElementById("userName").value = userName;

      let updateBtn = document.getElementById("update-btn");
      updateBtn.style.display = "inline-block";
      updateBtn.dataset.id = userId;
    });
  });
}

function delete_users(id) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");
  let request = store.delete(id);

  request.onsuccess = () => {
    console.log("  تم حذف المستخدم بنجاح!");
    add_toPage(db);
  };

  request.onerror = function (event) {
    console.error("  خطأ في حذف المستخدم:", event.target.error);
  };
}

function update_users(id) {
  let newName = document.getElementById("userName").value.trim();
  if (newName === "") {
    alert("  لا يمكن أن يكون الاسم فارغًا!");
    return;
  }

  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.get(id);

  request.onsuccess = function () {
    let user = request.result;
    if (user) {
      user.name = newName;
      let updateRequest = store.put(user);

      updateRequest.onsuccess = function () {
        console.log("  تم تحديث المستخدم بنجاح!");
        document.getElementById("userName").value = "";
        document.getElementById("update-btn").style.display = "none";
        add_toPage(db);
      };

      updateRequest.onerror = function (event) {
        console.error("  خطأ في تحديث المستخدم:", event.target.error);
        alert("  حدث خطأ أثناء تحديث المستخدم.");
      };
    } else {
      console.warn("  المستخدم غير موجود.");
    }
  };

  request.onerror = function (event) {
    console.error("  خطأ في جلب المستخدم:", event.target.error);
  };
}
