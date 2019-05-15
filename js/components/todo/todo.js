import { LitElement, html, css } from 'lit-element';
import { openDB } from '/node_modules/idb/build/esm/index.js';
import sync from '/js/sync.js';

export default class AppTodo extends LitElement {
  constructor() {
    super();
    this.description = "";
  }

  static get properties() {
    return {
      id: { type: Number },
      solved: { type: Number },
      description: { type: String },
      status: { type: Number }// 1 = need to update remote, 0 = sync, -1 = drop-it
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
      }
      .card {
        position: relative;
        margin-bottom: 12px;
        overflow: hidden;
        border-radius: 0px;
        box-shadow: var(--app-header-shadow);
        margin: 1rem;
      }
      .card a {
        display: block;
        text-decoration: none;
      }

      .card figure {
        position: relative;
        min-height: 30vh;
        padding: 0;
        margin: 0;
        background-color: hsla(0, 0%, 15%, 0.64);
      }
      .card img {
        display: block;
        object-fit: cover;
        width: 100%;
        height: 100%;
        max-height: 40vh;
      }
      .card .placeholder {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .card main {
        padding: 1rem;
        background-color: var(--app-card-color);
        transition: color 0.3s ease, background-color 0.3s ease;
      }
      /**
        * Persist animation using : animation-fill-mode set to forward 
        * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
        */
      .fade {
        -webkit-animation: fadeout 2s forwards; /* Safari and Chrome */
        -moz-animation: fadeout 2s forwards; /* Firefox */
        -ms-animation: fadeout 2s forwards; /* Internet Explorer */
        -o-animation: fadeout 2s forwards; /* Opera */
        animation: fadeout 2s forwards;
      }

      /* Key frame animation */
      @keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Firefox */
      @-moz-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Safari and Chrome */
      @-webkit-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      @media (min-width: 600px) {

      }

      /* Wide layout: when the viewport width is bigger than 460px, layout
      changes to a wide layout. */
      @media (min-width: 460px) {
        .card {
          flex-basis: 21%;
          margin: 2%;
        }
        .card figure {
          min-height: 20vh;
          height: 20vh;
          overflow: hidden;
        }
      }
    `;
  }

  async doUpdate(e){
    console.log(e.target.value);
    this.description = e.target.value;
    console.log(this.description);
    console.log("changed");

    try{
      const database = await openDB('app-store', 1, {
        upgrade(db) {
          db.createObjectStore('todos');
        }
      });

      await database.put('todos', {"id":this.id,"description":this.description, "solved":this.solved, "status":1}, this.id);

      //relancer la synchronisation
      sync();

    } catch(error) {
      console.log("error : "+error.message);
    }
  }

  async doDelete(){
    console.log("delete "+this.id);
    var id = this.id;

    this.status = -1;
    try{
      const database = await openDB('app-store', 1, {
        upgrade(db) {
          db.createObjectStore('todos');
        }
      });

      await database.put('todos', {"id":this.id,"status":this.status}, this.id);

      //relancer la synchronisation
      sync();

    } catch(error) {
      console.log("error : "+error.message);
    }
  }

  initCard(id, description, solved, status) {
    this.id = id;
    this.description = description;
    this.solved = solved;
    this.status = status;
  }

  render() {
    return html`
      <article class="card" id="${this.id}">
        <main>
          <p><textarea @change="${this.doUpdate}">${this.description}</textarea></p>
        </main>
        <footer>
          <button @click="${this.doDelete}">Supprimer</button>
        </footer>
      </article>
    `;
  }
}

customElements.define('app-todo', AppTodo);

