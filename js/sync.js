import { openDB } from '/node_modules/idb/build/esm/index.js';
import checkConnectivity from '/js/connection.js';

export default async function sync() {
  console.log("sync start");

  var connectionStatus = true;
  checkConnectivity();
  document.addEventListener('connection-changed', ({ detail }) => {
    connectionStatus = detail;
    console.log("connection for sync status : "+connectionStatus);
  });

  if(connectionStatus === true) {
    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('todos');
      }
    });

    const keys = await database.getAllKeys('todos');
    // console.log(keys);
    let todos = [];
    for (var i = keys.length - 1; i >= 0; i--) {
      todos.push(await database.get('todos',keys[i]));
    }
    // console.log(todos);

    for (var j = todos.length - 1; j >= 0; j--) {
      // console.log('loop starting');
      // console.log(todos[j]);
      var idTodo = todos[j]['id'];
      //delete
      if(todos[j]['status'] == -1){
        //delete on remote
        const myHeaders = new Headers({
          "Content-Type": "application/json",
        });

        const params = { method: 'DELETE',
                   headers: myHeaders,
                   mode: 'cors',
                   cache: 'default'};

        const result = fetch('http://localhost:3000/todos/'+todos[j]['id'], params).then( async (response) => {
          if(response.ok) {
            console.log("deleted");
            //remove en database if removed on JSON server
            await database.delete('todos',idTodo);
            const event = new CustomEvent('todo-deleted', {
              detail: idTodo
            });
            document.dispatchEvent(event);
          } else {
            console.log("Server refused the deletion");
            console.log(response);
            resolve(false);
          }
        }).catch(function(error) {
          console.log('General error on delete: ' + error.message);
        });
        
      }
      //update
      else if(todos[j]['status'] == 1){
        //update on remote
        const myHeaders = new Headers({
          "Content-Type": "application/json",
        });

        const params = { method: 'PATCH',
                   headers: myHeaders,
                   mode: 'cors',
                   cache: 'default',
                   body: JSON.stringify({"id":todos[j]["id"],"description":todos[j]["description"],"solved":todos[j]["solved"]})};

        //call to API to update
        const result = fetch('http://localhost:3000/todos/'+todos[j]["id"], params).then( async (response) => {
          if(response.ok) {
            //update status en database if updated on JSON server
            const todo = await database.get('todos',idTodo);
            await database.put('todos', {"id":todo["id"],"description":todo["description"], "solved":todo["solved"], "status":0}, idTodo);
            console.log("updated");
          } else {
            console.log("Server refused the update");
            console.log(response);
            resolve(false);
          }
        }).catch(function(error) {
          console.log('General error on update : ' + error);
        });
      }
    }
  }
}