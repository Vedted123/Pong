const firebaseConfig = {
  apiKey: "AIzaSyA9xmlbnn98hTKfWi5Of0OKHfy-nppTLNk",
  authDomain: "peer-2bd22.firebaseapp.com",
  databaseURL: "https://peer-2bd22-default-rtdb.firebaseio.com",
  projectId: "peer-2bd22",
  storageBucket: "peer-2bd22.appspot.com",
  messagingSenderId: "871101246393",
  appId: "1:871101246393:web:474ce51f90c8dff383a468"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
let currentUser = null;
let username = null;

function emailify(name) {
  return name + "@peerapp.com";
}

function login() {
  username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(emailify(username), password)
      .then(() => localStorage.setItem("username", username))
      .catch(e => alert(e.message));
}

function signup() {
  username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(emailify(username), password)
      .then(() => localStorage.setItem("username", username))
      .catch(e => alert(e.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    username = user.email.split("@")[0];
    localStorage.setItem("username", username);
    document.getElementById("authBox").classList.add("hide");
    document.getElementById("mainApp").classList.remove("hide");
    document.getElementById("displayUsername").textContent = username;
    syncData();
  } else {
    document.getElementById("authBox").classList.remove("hide");
    document.getElementById("mainApp").classList.add("hide");
  }
});

function toggleOther(select, otherId) {
  document.getElementById(otherId).style.display = select.value === "Other" ? "block" : "none";
}

function getSubject(selectId, otherId) {
  const select = document.getElementById(selectId);
  return select.value === "Other" ? document.getElementById(otherId).value.trim() : select.value;
}

function registerTutor() {
  const subject = getSubject("tutorSubject", "tutorOther");
  const grade = parseFloat(document.getElementById("tutorGrade").value);
  if (subject && !isNaN(grade)) {
    const id = db.ref("tutors").push().key;
    db.ref("tutors/" + id).set({ username: username, subject: subject, grade: grade });
  }
}

function registerSeeker() {
  const subject = getSubject("seekerSubject", "seekerOther");
  const grade = parseFloat(document.getElementById("seekerGrade").value);
  if (subject && !isNaN(grade)) {
    const id = db.ref("seekers").push().key;
    db.ref("seekers/" + id).set({ username: username, subject: subject, grade: grade });
  }
}

function syncData() {
  db.ref("matches").on("value", snap => {
    const data = snap.val() || {};
    renderMatches(data);
  });
}

function renderMatches(data) {
  const list = document.getElementById("matchedList");
  list.innerHTML = '';
  for (let id in data) {
    const m = data[id];
    const row = "<tr>" +
      "<td>" + m.seekerName + "</td><td>" + m.subject + "</td><td>" + m.seekerGrade + "</td>" +
      "<td>" + m.tutorName + "</td><td>" + m.tutorGrade + "</td>" +
      "<td><a href='peerchat.html'><button>Chat</button></a></td>" +
      "</tr>";
    list.innerHTML += row;
  }
}
