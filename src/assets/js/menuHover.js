console.log("MENU HOVER DOC");

function addActive(element) {
  console.log("ADD CLASS ACTIVE EL", element);
  let documents = document.getElementsByClassName('menu-nav-item-link');

  for (let i = 0; i < documents.length; i++) {
    documents[i].classList.remove('active')
  }
  element.classList.add('active');
}

