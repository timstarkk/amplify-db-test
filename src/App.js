import React, { Component } from 'react';
import './App.css';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import config from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';

Amplify.configure(config);

const query = `
  query {
    listTodos {
      items {
        id name description
      }
    }
  }
`

class App extends Component {
  state = {
    todos: [],
    sub: ""
  }

  async componentDidMount() {
    const data = await API.graphql(graphqlOperation(query));
    this.setState({
      todos: data.data.listTodos.items
    })
  }

  handleButtonClick = async function () {
    let name = document.getElementById('input1').value
    let description = document.getElementById('input2').value

    console.log(name);
    console.log(description);
    const addItem = `
      mutation {
        createTodo(input: {
          name: "${name}"
          description: "${description}"
        }) {
          id name description
        }
      }
    `
    API.graphql(graphqlOperation(addItem))
    this.forceUpdate();
  }

  handleAuthButton() {
    Auth.currentSession()
      .then(data => {
        let sub = data.accessToken.payload.sub;

        this.setState({
          sub
        })
      })
      .catch(err => console.log(err));
  }

  handleAddToCart(item) {
    console.log(item)
  }

  render() {
    return (
      <div>
        {
          this.state.todos.map((todo, index) => (
            <section key={index}>
              <p>{todo.name}</p> <button onClick={() => { this.handleAddToCart(todo) }}>add to cart</button>
            </section>
          ))
        }
        <input type="text" id="input1" placeholder="name..." />
        <input type="text" id="input2" placeholder="description..." />
        <button id="theButton" onClick={() => { this.handleButtonClick() }}>add item</button>
        <button id="authButton" onClick={() => { this.handleAuthButton() }}>currentSession</button>
        <button id="subButton" onClick={() => { console.log(this.state.sub) }}>user sub</button>
      </div >
    )
  }
}

export default withAuthenticator(App, true);