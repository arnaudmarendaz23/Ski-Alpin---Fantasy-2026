document.addEventListener("DOMContentLoaded", function () {
    // Fonction pour insérer les données dans un tableau
    function remplirTableau(classementData, tableauId) {
        const tableau = document.getElementById(tableauId);
        const tbody = tableau.querySelector('tbody');
        tbody.innerHTML = ''; // Clear any existing rows
        
        classementData.forEach(item => {
            const row = document.createElement('tr');
            const positionCell = document.createElement('td');
            positionCell.textContent = item.position;
            
            const nomCell = document.createElement('td');
            nomCell.textContent = item.nom;
            
            const pointsCell = document.createElement('td');
            pointsCell.textContent = item.points;
            
            row.appendChild(positionCell);
            row.appendChild(nomCell);
            row.appendChild(pointsCell);
            tbody.appendChild(row);
        });
    }

    // Charger les fichiers JSON et insérer les données dans les tableaux
    function chargerClassement(url, tableauId) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Données chargées pour", url, data);  // Ajout d'un log pour vérifier les données
                remplirTableau(data, tableauId);
            })
            .catch(error => {
                console.error("Erreur lors du chargement du fichier JSON:", error);
            });
    }

    // Charger les classements pour chaque type
    chargerClassement('classement_sl.json', 'sl-table');
    chargerClassement('classement_gs.json', 'gs-table');
    chargerClassement('classement_sg.json', 'sg-table');
    chargerClassement('classement_dh.json', 'dh-table');
    chargerClassement('classement_general.json', 'general-table');
});

document.getElementById('tableSearch').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#myTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
});

// Sélection des éléments
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const registerLink = document.getElementById('registerLink');
const topnav = document.querySelector('.topnav');
const currentUser = localStorage.getItem('currentUser');

// Ouvrir la popup de connexion
loginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    loginModal.style.display = 'block';
});

// Ouvrir la popup d'inscription
registerLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

// Fermer les popups
closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

// Fermer en cliquant à l'extérieur
window.addEventListener('click', (event) => {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === registerModal) registerModal.style.display = 'none';
});


// Soumission du formulaire d'inscription
document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const regUsername = document.getElementById('regUsername').value.trim();
    const regPassword = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('registerError');

    errorElement.style.display = 'none';
    errorElement.textContent = '';

    if (userExists(regUsername)) {
        errorElement.style.display = 'block';
        errorElement.textContent = 'This username is already taken. Choose another one.';
        return;
    }

    if (regPassword !== confirmPassword) {
        errorElement.style.display = 'block';
        errorElement.textContent = 'Passwords are different.';
        return;
    }

    saveUser(regUsername, regPassword);
    registerModal.style.display = 'none';
    alert('Account created successfully. Please log in.');
});

// Récupère ou initialise les utilisateurs dans localStorage
let registeredUsers = JSON.parse(localStorage.getItem('users')) || [];

// Fonction pour sauvegarder un nouvel utilisateur
function saveUser(username, password) {
    registeredUsers.push({ username, password });
    localStorage.setItem('users', JSON.stringify(registeredUsers));
}

// Vérifie si un utilisateur existe déjà
function userExists(username) {
    return registeredUsers.some(user => user.username === username);
}

// Modifier la logique de connexion pour afficher/masquer les boutons
document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!userExists(username)) {
      alert('Account does not exist. Please register.');
      return;
  }

  const user = registeredUsers.find(user => user.username === username);

  if (user.password !== password) {
      alert('Incorrect password.');
      return;
  }

  localStorage.setItem('currentUser', username); // Sauvegarde de l'utilisateur connecté

  loginModal.style.display = 'none'; // Ferme la popup de connexion
  loginBtn.style.display = 'none'; // Cache le bouton de connexion
  logoutBtn.style.display = 'block'; // Affiche le bouton de déconnexion
});

window.addEventListener('userLoggedIn', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
      console.log('Utilisateur connecté:', currentUser);
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';

      // Mettre à jour dynamiquement les données de la page après connexion
      afficherEquipesSauvegardees(currentUser);
  }
});

function afficherEquipesSauvegardees(user) {
  // Exemple de fonction pour charger les équipes liées à l'utilisateur
  const equipes = JSON.parse(localStorage.getItem(`equipes_${user}`)) || [];
  const equipeContainer = document.getElementById('equipeContainer');

  equipeContainer.innerHTML = ''; // Efface les anciennes données
  equipes.forEach(equipe => {
      const div = document.createElement('div');
      div.textContent = `Équipe : ${equipe.nom}`;
      equipeContainer.appendChild(div);
  });
}