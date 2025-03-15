const request = indexedDB.open("DataDb", 1);

request.onerror = (event) => {
  console.error("❌ لا يمكن فتح قاعدة البيانات:", event.target.error);
};

request.onsuccess = (event) => {
  let db = event.target.result;

  add_toPage(db);

  let btnDB = document.getElementById("addUser");
  btnDB.addEventListener("click", () => {
    let dbValue = document.getElementById("userName").value;
    if (dbValue.trim() !== "") {
      addUser(db, dbValue);
    } else {
      alert("⚠️ الرجاء إدخال اسم المستخدم");
    }
  });
};

request.onupgradeneeded = (event) => {
  let db = event.target.result;
  let store = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("name", "name", { unique: true });
};

// إضافة مستخدم جديد
function addUser(db, name) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.add({ name: name });

  request.onsuccess = function () {
    console.log("✅ المستخدم تمت إضافته بنجاح!");
    document.getElementById("userName").value = ""; // مسح الحقل بعد الإضافة
    add_toPage(db);
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في إضافة المستخدم:", event.target.error);
    alert("⚠️ المستخدم موجود بالفعل!");
  };
}

// جلب المستخدمين وعرضهم على الصفحة
function add_toPage(db) {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");
  let request = store.getAll();

  request.onsuccess = () => {
    let list = document.getElementById("userList");
    list.innerHTML = "";
    request.result.forEach((user) => {
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

    // إضافة حدث الحذف
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        delete_users(db, parseInt(btn.dataset.id));
      });
    });

    // إضافة حدث التحديث
    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        let userId = parseInt(btn.dataset.id);
        let userName = btn.dataset.name;
        document.getElementById("userName").value = userName;
        document.getElementById("updateBtn").style.display = "inline-block";

        document.getElementById("updateBtn").onclick = function () {
          update_users(db, userId);
        };
      });
    });
  };

  request.onerror = (event) => {
    console.error("❌ لا يمكن جلب المستخدمين:", event.target.error);
  };
}

function delete_users(db, id) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");
  let request = store.delete(id);

  request.onsuccess = () => {
    add_toPage(db);
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في حذف المستخدم:", event.target.error);
  };
}

function update_users(db, id) {
  let newName = document.getElementById("userName").value;
  if (newName.trim() === "") {
    alert("⚠️ لا يمكن أن يكون الاسم فارغًا!");
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
        document.getElementById("userName").value = "";
        document.getElementById("updateBtn").style.display = "none";
        add_toPage(db);
      };

      updateRequest.onerror = function (event) {
        console.error("❌ خطأ في تحديث المستخدم:", event.target.error);
        alert("⚠️ حدث خطأ أثناء تحديث المستخدم.");
      };
    } else {
      console.warn("⚠️ المستخدم غير موجود.");
    }
  };

  request.onerror = function (event) {
    console.error("❌ خطأ في جلب المستخدم:", event.target.error);
  };
}
