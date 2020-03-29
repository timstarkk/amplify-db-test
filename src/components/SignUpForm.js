import React, { Component } from 'react';
import { Auth } from 'aws-amplify';

export default class SignUpForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            email: '',
            phoneNumber: '',
            confirmationCode: '',
            signedUp: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const { signedUp, username, password, email, phoneNumber, confirmationCode } = this.state;
        if (!signedUp) {
            Auth.signUp({
                username,
                password,
                attributes: {
                    email,
                    phoneNumber
                }
            })
                .then(() => console.log('signed up'))
                .catch(error => console.log(error))

            this.setState({
                signedUp: true
            });
        } else {
            Auth.confirmSignUp(username, confirmationCode)
                .then(() => console.log('confirmed sign up'))
                .catch(error => console.log(error))
        }

    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }
    render() {
        const { signedUp } = this.state;

        if (signedUp) {
            return (
                <form>
                    <label>Username</label>
                    <input type="text" name="username" onChange={this.handleChange} />
                    <label>Confirmation Code</label>
                    <input type="text" name="confirmationCode" onChange={this.handleChange} />
                    <button>Confirm</button>
                </form>
            )
        } else {
            return (
                <form onSubmit={this.handleSubmit}>
                    <label>Username</label>
                    <input type="text" name="username" onChange={this.handleChange} />
                    <label>Password</label>
                    <input type="text" name="password" onChange={this.handleChange} />
                    <label>Email</label>
                    <input type="text" name="email" onChange={this.handleChange} />
                    <label>Phone Number</label>
                    <input type="text" name="phoneNumber" onChange={this.handleChange} />
                    <button>Sign Up</button>
                </form>
            )
        }
    }
}
