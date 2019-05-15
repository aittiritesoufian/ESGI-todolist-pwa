import AppTodo from '/js/components/todo/todo.js';
import { openDB } from '/node_modules/idb/build/esm/index.js';
// import checkConnectivity from '/js/connection.js';

(async function(document) {
  const app = document.querySelector('#app');
  const skeleton = app.querySelector('.skeleton');
  const listPage = app.querySelector('[page=list]');
  skeleton.removeAttribute('active');
  listPage.setAttribute('active', '');

  // delete card on delete task;
  document.addEventListener('todo-deleted', ({ detail }) => {
    const card = document.getElementById(detail);
    card.remove();
  });

  window.addEventListener('online', e => {
    // todo
    console.log('online');
  });
  window.addEventListener('offline', e => {
    setTimeout(() => {
      // todo
      console.log('offline');
    }, 3000);
  });

  try {
    const data = await fetch('http://localhost:3000/todos');
    const json = await data.json();
  
    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('todos');
      }
    });
  
    if (navigator.onLine) {
      await database.put('todos', json, 'todos');
    }

    const todos = await database.get('todos', 'todos');
  
    const cards = todos.map(item => {
      const cardElement = new AppTodo();
      
      cardElement.initCard(
        item.id,
        item.description,
        item.solved);
      listPage.appendChild(cardElement);

      return cardElement;
    });

    //create todo
    const createForm = document.querySelector('#add-todo');
    createForm.querySelector('textarea#description').addEventListener('keyup', async function(e){
      e.preventDefault();
      if(e.keyCode === 13) {
        //creation provisoire de la tâche
        let newTodo = {description: e.target.value,solved: 0};
        
        //envoi sur le serveur
        const response = await fetch('http://localhost:3000/todos', {
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(newTodo)
        });
        
        // ajout dans InnoDB à partir de la création sur json-server
        newTodo = await response.json();
        console.log(newTodo);
        todos.push(newTodo);
        database.put('todos', todos, 'todos');

        //ajout de la card en front
        const cardElement = new AppTodo();
        cardElement.initCard(
          newTodo.id,
          newTodo.description,
          newTodo.solved);
        listPage.appendChild(cardElement);
        e.target.value = "";
        // console.log(result);
      }
    });
  
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     */
    const options = {
      rootMarging : '0px 0px 0px 0px'
    };
    const callback = entries => {
      entries.forEach((entry) => {
        // If image element in view
        if (entry.isIntersecting) {
          // Actualy load image
          const card = entry.target
        }
      });
    };
  
    const io = new IntersectionObserver(callback, options);
    // Observe cards as they enter the viewport
    cards.forEach(card => {
      io.observe(card);
    }); 
  } catch(error) {
    console.error(error);
  }
})(document);
