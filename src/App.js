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
    this.handleAuthButton();
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

  handleAddToCart = async (item) => {
    let currentSub = this.state.sub;
    console.log(item);
    let findCart = `
      query {
        listShoppingCarts(filter:{
          userSub: {
            contains: "${currentSub}"
          }
        }) {
          items {
            id
            userSub
            items {name description}
          }
        }
      }
    `
    API.graphql(graphqlOperation(findCart)).then(response => {
      if (response.data.listShoppingCarts.items[0]) {
        let tempItems = [];
        tempItems = response.data.listShoppingCarts.items[0].items.map(item => {
          return item;
        })
        tempItems.push({
          name: `${item.name}`,
          description: `${item.description}`
        })
        let tempJson = JSON.stringify(tempItems);
        let mutationItems = tempJson.replace(/"([^"]+)":/g, '$1:');

        console.log(mutationItems);




        let cartId = response.data.listShoppingCarts.items[0].id
        // run an update to the shopping cart for current user.
        let updateCart = `
          mutation {
            updateShoppingCart(input: {
              id: "${cartId}"
              items: ${mutationItems}
            }){
              id userSub items{ name description }
            }
          }
        `
        console.log(cartId);
        API.graphql(graphqlOperation(updateCart)).then(res => {
          console.log('cart updated successfully');
        }).catch(error => console.log(error))

      } else {
        // create a shopping cart for current user with selected item.
        let createCart = `
          mutation {
            createShoppingCart(input: {
              userSub: "${currentSub}"
              items: [{
                name: ${item.name}
                description: ${item.description}
              }]
            }){
              id userSub items{ name description }
            }
          }
        `

        API.graphql(graphqlOperation(createCart)).then(res => {
          console.log('cart created successfully');
        })
      }
    })
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