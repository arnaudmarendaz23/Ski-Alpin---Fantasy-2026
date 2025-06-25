document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Vérifiez si l'utilisateur est connecté
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        // Si l'utilisateur est connecté
        loginBtn.style.display = 'none'; // Cache le bouton de connexion
        logoutBtn.style.display = 'block'; // Affiche le bouton de déconnexion
        loginBtn.innerHTML = `<img src="icons/connected.png" alt="Connected" class="nav-icon-login">`;
    } else {
        // Si l'utilisateur n'est pas connecté
        loginBtn.style.display = 'block'; // Affiche le bouton de connexion
        logoutBtn.style.display = 'none'; // Cache le bouton de déconnexion
    }
});

logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const confirmLogout = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmLogout) {
        // Supprimer les informations de l'utilisateur connecté
        localStorage.removeItem('currentUser');
        
        // Rediriger vers une page (ex. accueil ou connexion)
        window.location.reload(); // Recharge la page actuelle pour mettre à jour l'interface
    }
});

function login(username) {
    localStorage.setItem("currentUser", username); // Sauvegarde de l'utilisateur connecté
    window.dispatchEvent(new Event('userLoggedIn'));  // Déclenche l'événement
    alert(`Bienvenue ${username} !`);
}

function updateUIAfterLogin() {
    const user = localStorage.getItem("currentUser");
    if (user) {
      // Masquer le bouton de connexion et afficher le bouton de déconnexion
      document.getElementById("loginBtn").style.display = "none";
      document.getElementById("logoutBtn").style.display = "block";
    }
  }
  
  // Gestion de la soumission du formulaire de connexion
  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();  // Empêche le formulaire de recharger la page
    
    // Récupère les informations de connexion
    const username = document.getElementById("username").value;
    
    // Enregistrer l'utilisateur dans le localStorage
    localStorage.setItem("currentUser", username);
    
    // Met à jour l'interface pour refléter l'état connecté
    updateUIAfterLogin();
  });
  
  // Vérifier si l'utilisateur est déjà connecté lors du chargement de la page
  window.addEventListener('DOMContentLoaded', (event) => {
    updateUIAfterLogin();
  });