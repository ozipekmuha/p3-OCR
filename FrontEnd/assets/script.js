document.addEventListener('DOMContentLoaded', () => {
  function getTokenValue() {
    if (verifyToken()) {
      return localStorage.getItem('bearerToken');
    }
    return null; // normalement on arrive pas ici car la modale est accessible que quand un token est présent
  };
  function addEditButon() {
    // 
    let editBtn = document.createElement('p');
    editBtn.innerHTML = '<p style="margin-bottom:1em"><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i>modifier</a></p> ';

    let titleEdit = document.querySelector('#title-projet > h2');

    titleEdit.insertAdjacentElement('afterend', editBtn);
  };
  function removeToken() {
    localStorage.removeItem('bearerToken');
    window.location.href = 'index.html';

  };

  function authStatus() {
    let navAuthStatus = document.getElementById('auth-status');
    if (verifyToken()) {
      // navAuthStatus.textContent = 'logout';
      navAuthStatus.innerHTML = `<a href="./index.html">logout</a>`;

      navAuthStatus.addEventListener('click', (event) => {
        event.preventDefault();
        removeToken();
      })

    } else {
      navAuthStatus.innerHTML = `<a href="./assets/login.html">login</a>`;
    }
  };

  function showTopBanner() {

    let token = localStorage.getItem('bearerToken');

    if (token) {
      createTopBanner();
    }
  };


  function verifyToken() {
    return localStorage.getItem('bearerToken') !== null;
  };

  // URLs de l'API
  const worksUrl = 'http://localhost:5678/api/works/';
  const catUrl = 'http://localhost:5678/api/categories';

  let isCatlatogEmpty = true;

  authStatus();

  showTopBanner();

  hideModal();
  hideFormAddPicModal();


  function checkAuthStatus() {
    //  Chercher le token dans le local storage
    if (verifyToken()) {
      // console.log(verifyToken())
      // console.log('utilisateur authentifié')
      addEditButon();

    } else {
      return
    }
  };
  checkAuthStatus();

  // Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
  async function getData(route, url) {
   
    const response = await fetch(url);
    let data = await response.json();
    if (route === 'works') {
    
      populateCatalog(data);
      populateModal(data);
    } else if (route === 'cat') {
    
      createFilters(data);
    } return
  };
  getData('works', worksUrl);
  getData('cat', catUrl);



  function targetPostForm() {

    // Sélectionner le formulaire
    let form = document.getElementById('post-form');

    
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      postWork(worksUrl);
    });

  };
  targetPostForm();



  function postWork(worksUrl) {
   
    let form = document.getElementById('post-form');


    let formData = new FormData();

  
    let imageInput = document.getElementById('upload-photo');
    if (imageInput && imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0]);
    }

    // console.log("image de bg : " + imageInput);

    let titleInput = document.getElementById('title');
    if (titleInput) {
      formData.append('title', titleInput.value);
    }

    let categorySelect = document.getElementById('category');
    if (categorySelect) {
      formData.append('category', categorySelect.value);
    }

    // Vérification des données ajoutées
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    let bearerToken = getTokenValue();
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + bearerToken);

    let requestOptions = {
      method: 'POST',
      headers: headers,
      body: formData
    };

    fetch(worksUrl, requestOptions)
      .then(response => {
        console.log("Response Status:", response.status);

        if (!response.ok) {
          return response.text().then(text => {
            console.error("Error response:", text);
            throw new Error(text);
          });
        }

        return response.text();
      })
      .then(result => {
        console.log("Result:", result);
        getData('works', worksUrl);
        hideFormAddPicModal();
        retabBtnModal();
      })
      .catch(error => console.error('Error:', error));
  }


  function retabBtnModal() {
    //  Cibler le séparateur et le bouton ajouter photo de la modale
    let separator = document.querySelector('.modal-separator')
    let addPicBtn = document.querySelector('.btn-modal')

    // Remplacer display:none par flex
    separator.style = "display: flex";
    addPicBtn.style = "display: flex";

    // Rappel de showModal() pour réablir le div controles (back/close) 
    showModal();
  };


  function populateCatalog(data) {
    // Cibler le container où insérer les éléments et le stocker dans collection
    let collection = document.querySelector("#collection");

    // Vérifier si le catalogue est vide
    if (isCatlatogEmpty === true) {
      // Boucler sur chaque objet et les afficher sur la page
      data.forEach(obj => {
        // apeller la fonction d'insertion
        insertIntoCatalog(collection, obj);
      });
      // Changer l'état de la variable pour les prochaines executions
      isCatlatogEmpty = false;

      // Si le catalogue est rempli, ajouter uniquement le dernier obj de data
    } else {
      let lastWork = data[data.length - 1];
      insertIntoCatalog(collection, lastWork);
    }
  };


  function insertIntoCatalog(collection, obj) {
    // Crée un container Figure
    let element = document.createElement('figure');
    // Insérer le code HTML dans les containers Figure
    element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;
    // ajouter la classe avec l'id de catégory aux figures pour les filtrer avec le CSS
    element.classList.add('works', `cat-id-${obj.category.id}`);

    // insérer l'id dans la balise HTML pour le cibler plus tard
    element.id = obj.id;

    // ajouter au container stocké dans collection les elements figure
    collection.appendChild(element);
  };


  function createEditGallery() {
    // Sélectionner le titre avec l'ID 'title-modal'
    let titleModal = document.getElementById('title-modal');
    // Injecter le titre 
    titleModal.innerText = "Galerie photo";
    // Créer un <div>
    let divElement = document.createElement('div');
    divElement = document.createElement('div');
    divElement.id = 'js-div-edit-gallery';
    //  Ajout de la classe modal-1-1 pour passer en display-none
    divElement.className = "js-modal-1-1";
    // Insérer le <div>
    titleModal.insertAdjacentElement('afterend', divElement);
  };

  function populateModal(data) {
    createEditGallery();
    data.forEach(obj => {
      let modalWrapper = document.querySelector('#js-div-edit-gallery');
 
      let element = document.createElement('figure');
      element.className = 'js-modal-figure';

      element.innerHTML = `
      <button class="js-delete-work-btn delete-btn-icon" id="${obj.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <img src="${obj.imageUrl}" alt="${obj.title}">`;
      modalWrapper.appendChild(element);
    });
    targetDeleteWorkBtn();
  };

  function targetDeleteWorkBtn() {
    let deleteBtn = document.querySelectorAll('.js-delete-work-btn');

    deleteBtn.forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();

      
        let deleteBtnClicked = event.target;

      
        if (deleteBtnClicked.tagName === 'I') {
          deleteBtnClicked = deleteBtnClicked.parentElement;
        }
        
        let btnId = deleteBtnClicked.id;
        console.log(deleteBtnClicked)
        // TODO : Confirmation de suppression ?


        deleteWork(btnId);
      })
    })
  };

  function deleteWork(id) {
    let bearerToken = getTokenValue();

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + bearerToken);

    let requestOptions = {
      method: 'DELETE',
      headers: headers
    };

    
    let deleteUrl = `${worksUrl}${id}`;

    fetch(deleteUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(result => {
       
        // console.log('vvvv :', result);

        hideDeletedWork(id);
      })
      .catch(error => console.log('Error:', error));
  }



  function hideDeletedWork(id) {
    // Target l'element dans la modale avec son id
    // Comme c'est le bouton qui a l'id , on utilise la méthode closest chainé à au QuerySelector.
    const workElementModal = document.querySelector(`.js-modal-figure button[id="${id}"]`)
      .closest('.js-modal-figure');

    // Masquer l'élément
    workElementModal.style = "display:none";

    // Target l'element dans le Catalog  avec son id ;
    const workElementCatalog = document.querySelector(`#collection`)
      .querySelector(`[id="${id}"]`)
    // ! Comprendre pourquoi il y a 2 sorties console !
    console.log(workElementCatalog)

    workElementCatalog.style = "display:none";
  };


  function targetEditBtn() {
    // cibler les bouton d'ouverture de la modale
    let btnEditList = document.querySelectorAll('.js-open-modal');
    let i = 0;
    //  ajouter un écouteur sur chaque bouton et déclencher la modale
    for (i = 0; i < btnEditList.length; i++) {
      btnEditList[i].addEventListener('click', function (event) {
        event.preventDefault();
        showModal();
      })
    };
  };
  targetEditBtn();


  function showModal() {
    let modalWrapper = document.querySelector('#modal')
    modalWrapper.style = "display : block";
    // cibler le bouton back flèche
    let backBtn = document.querySelector('.js-back-modal');
    backBtn.style.display = 'none';
    // aligner le bouton close sur la vue modal 1-2
    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row-reverse;"
  };


  // TODO : Faire en sorte qu'au clic en dehors de la modale, elle se ferme aussi
  function targetCloseModalBtn() {
    // cibler le bouton de fermeture de la modale
    let btnCloseModal = document.querySelector('.js-close-modal');
    // console.log(btnCloseModal);
    btnCloseModal.addEventListener('click', () => {
      hideModal();
    });
  };
  targetCloseModalBtn();


  function targetAddPicBtn() {
    // cibler le bouton d'ajout de photo dans la modale
    let btnAddPic = document.querySelector('.btn-modal');
    btnAddPic.addEventListener('click', () => {
      hideGalleryModal(); 
      showFormAddPicModal();
    });
  };
  targetAddPicBtn();


  function hideGalleryModal() {

    let titleModal = document.getElementById('title-modal');
    // Injecter le titre de la seconde vue
    titleModal.innerText = "Ajout photo";
    // Passer en display:none le div EditGallery
    let divElement = document.querySelector('#js-div-edit-gallery')
    divElement.style = "display:none";

    let element = document.querySelectorAll('.js-modal-1-1');
  };

  function hideFormAddPicModal() {
    let formElement = document.querySelector('.form-upload-work');
    formElement.style = 'display:none';
  };

  function showFormAddPicModal() {
    let formElement = document.querySelector('.form-upload-work');
    formElement.style = 'display:flex';

    // cibler les éléments class modal-1-2 et les passer en display:none
    let elementsToHide = document.querySelectorAll('.modal-1-2');

    elementsToHide.forEach((element) => {
      element.style.display = 'none';
    });

    // cibler le bouton back flèche
    let backBtn = document.querySelector('.js-back-modal');
    backBtn.style.display = 'flex';

    // aligner le bouton close sur la vue modal 1-2
    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row;"

    // revenir à la vue 1 de la modale
    backBtn.addEventListener('click', () => {
      retabInitModal(backBtn, closeBtn, formElement, elementsToHide)
    });
  };


  function retabInitModal(backBtn, closeBtn, formElement, elementsToHide) {

    backBtn.style.display = 'none';
    closeBtn.style = "flex-direction: row-reverse;"
    formElement.style = 'display:none';
    elementsToHide.forEach((element) => {

      element.style.display = 'flex';
    });

    function setupModalCloseOnOutsideClick() {
      let modalWrapper = document.querySelector('#modal');
      modalWrapper.addEventListener('click', (event) => {
        if (event.target === modalWrapper) {
          hideModal();
        }
      });
    }
    setupModalCloseOnOutsideClick();


    // todo : checker ce code pour réafficher la galerie
    let titleModal = document.getElementById('title-modal');
    // Injecter le titre de la première vue
    titleModal.innerText = "Galerie photo";
    // Passer en display:none le div EditGallery
    let divElement = document.querySelector('#js-div-edit-gallery')
    divElement.style = "display:flex";

  };


  function hideModal() {
    let modalWrapper = document.querySelector('#modal');
    if (modalWrapper) {
      modalWrapper.style.display = 'none';
    }
  }

  function createFilters(data) {
    let zoneFiltres = document.createElement('div');
    zoneFiltres.className = 'btn-list';
    zoneFiltres.id = 'js-btn-list';

    let all = document.createElement('input');
    all.type = 'button';
    all.value = 'Tous';
    all.className = 'btn-cat';
    all.id = '0';
    zoneFiltres.appendChild(all);


    for (let i = 0; i < 3; i++) {
      let bouton = document.createElement('input');
      bouton.type = 'button';
      bouton.value = data[i].name;
      bouton.className = 'btn-cat';
      bouton.id = data[i].id;
      zoneFiltres.appendChild(bouton);
    };

    let titrePortfolio = document.querySelector('#portfolio > div');
    // insèrer après titrePortfolio sans l'imbriquer à l'intérieur avec insertAdjacentElement afterend
    titrePortfolio.insertAdjacentElement('afterend', zoneFiltres);

    filterWorks();
    hideFilters(zoneFiltres);
  };


  // fonction pour lister les boutons filtres et ajouter un eventlistner
  function filterWorks() {
    // cibler les boutons de filtre
    let TableauBoutonsFiltre = document.querySelectorAll('.btn-cat')
    // Ajouter un eventlistner sur chaque boutons
    for (let i = 0; i < TableauBoutonsFiltre.length; i++) {
      TableauBoutonsFiltre[i].addEventListener('click', function () {
        hideWorks(i);
      });
    };
  };

  // Todo : Améliorer le masquage en mode connecté 
  function hideFilters() {
    if (verifyToken() === true) {
      let zoneFiltres = document.getElementById('js-btn-list');
      zoneFiltres.style.display = 'none';
      showAllWorks();
    } return
  };

  function showAllWorks() {
    hideWorks(0)
  };

  // fonction appelée par le addEventListner au clic sur les boutons filtre catégorie
  function hideWorks(id) {
    let allWorks = document.querySelectorAll('#collection .works'); 
    allWorks.forEach(works => {   
      if (id === 0) {
        works.style.display = 'block';
      } else {
        if (works.classList.contains(`cat-id-${id}`)) {
          works.style.display = 'block';
        } else {
          works.style.display = 'none';
        }
      }
    }
    );
  };

  function createTopBanner() {

    if (document.querySelector('.top-banner-edit')) {
      return;
    }

    let topBanner = document.createElement('div');


    topBanner.className = 'top-banner-edit';
    topBanner.innerHTML = '<p"><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> MODE Édition</a></p>';


    let html = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    html.insertBefore(topBanner, body);
  };

  // TODO : Placeholder Image Preview



  function previewImage() {
    let imageInput = document.getElementById('upload-photo');
    let preview = document.getElementById('image-preview');

    if (imageInput && preview) {
      imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        } else {
          preview.style.display = 'none';
        }
      });
    }
  }
  previewImage();


});