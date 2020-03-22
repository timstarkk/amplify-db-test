import React, { Component } from 'react';
import './App.css';
import { API, graphqlOperation } from 'aws-amplify';

const query = `
  query {
    listTodos {
      items {
        id name description
      }
    }
  }
`

export default class App extends Component {
  state = {
    todos: []
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
  }

  render() {
    return (
      <div>
        {
          this.state.todos.map((todo, index) => (
            <p key={index}>{todo.name}</p>
          ))
        }
        <input type="text" id="input1" placeholder="name..." />
        <input type="text" id="input2" placeholder="description..." />
        <button id="theButton" onClick={() => { this.handleButtonClick() }}>add item</button>
      </div >
    )
  }
}