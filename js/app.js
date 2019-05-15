import AppTodo from '/js/components/todo/todo.js';
import { openDB } from '/node_modules/idb/build/esm/index.js';
import checkConnectivity from '/js/connection.js';

(async function(document) {
  const app = document.querySelector('#app');
  const skeleton = app.querySelector('.skeleton');
  const listPage = app.querySelector('[page=list]');
  skeleton.removeAttribute('active');
  listPage.setAttribute('active', '');

  // delete card on delete task;
  document.addEventListener('todo-deleted', ({ detail }) => {
    console.log(detail);
    const card = document.getElementById(detail);
    card.remove();
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
      for (var i = json.length - 1; i >= 0; i--) {
        // json[i]["id"];
        // json[i]["description"];
        // json[i]["solved"];
        console.log(json[i]);
        await database.put('todos', {"id":json[i]["id"],"description":json[i]["description"], "solved":json[i]["solved"], "status":0}, json[i]["id"]);
      }
      // await database.put('todos', json, 'todo');
    }

    const keys = await database.getAllKeys('todos');
    let todos = [];
    for (var i = keys.length - 1; i >= 0; i--) {
      todos[keys[i]] = await database.get('todos',keys[i]);
    }
    // console.log(todos);
  
    const cards = todos.map(item => {
      const cardElement = new AppTodo();
      
      cardElement.initCard(
        item.id,
        item.description,
        item.solved,
        item.status);
      listPage.appendChild(cardElement);

      return cardElement;
    });
    console.log(cards);

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
        // todos.push(newTodo);
        database.put('todos', {"id":newTodo.id, "description":newTodo.description, "solved":newTodo.solved, "status":0}, newTodo.id);

        //ajout de la card en front
        const cardElement = new AppTodo();
        cardElement.initCard(
          newTodo.id,
          newTodo.description,
          newTodo.solved,
          newTodo.status);
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
