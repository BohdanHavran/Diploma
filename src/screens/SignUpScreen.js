import React, { useState } from 'react'
import Bounce from 'react-reveal/Bounce'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import Button from '../components/Form/Button'
import TextField from '../components/Form/TextField'
import useAuth from '../hooks/useAuth'
import swal from 'sweetalert';
//import { useHistory } from 'react-router-dom';

const SignUpScreen = () => {
    //const history = useHistory();
    const [userInput, setUserInput] = useState({
        name: '',
        email: '',
        image: '',
        password: '',
    })
    const { signUpUser } = useAuth()

    //form inputs
    const Inputs = [
        { id: 1, type: "text", placeholder: "Name", value: `${userInput.name}`, name: 'name' },
        { id: 2, type: "email", placeholder: "Email", value: `${userInput.email}`, name: 'email' },
        { id: 3, type: "text", placeholder: "Profile Picture Link", value: `${userInput.image}`, name: 'image' },
        { id: 4, type: "password", placeholder: "Password", value: `${userInput.password}`, name: 'password' },
    ]

    //handle change 
    const handleChange = (e) => {
        const { value, name } = e.target;
        setUserInput(prev => {
            return {
                ...prev,
                [name]: value
            }
        })

    }
    //handle submit form 
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Перевірка, чи всі поля (окрім фото) заповнені
        if (!userInput.name || !userInput.email || !userInput.password) {
            swal("Error", "Please fill in all fields except the profile picture.", "error");
            return;
        }
    
        // Викликаємо функцію реєстрації користувача
        await signUpUser(userInput.email, userInput.password, userInput.name, userInput.image);
    }

    return (
        <main className="h-screen w-full banner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                {/* form  */}
                <Bounce left>
                    <div className="flex flex-col justify-center items-center h-screen">
                        {/* logo  */}
                        <Brand />
                        {/* sign up form  */}
                        <form className="bg-white w-96 mt-6 p-4 rounded-lg shadow-lg" onSubmit={handleSubmit}>
                            <div className="flex flex-col space-y-6">
                                {Inputs.map(input => (
                                    <TextField
                                        key={input.id}
                                        type={input.type}
                                        placeholder={input.placeholder}
                                        value={input.value}
                                        name={input.name}
                                        onChange={handleChange}
                                    />
                                ))}
                            </div>
                            <Button text="Sign Up" />
                            <Link to="/signin">
                                <p className="text-base text-primary text-center my-6 hover:underline">Already have an account ?</p>
                            </Link>
                        </form>
                    </div>
                </Bounce>

                {/* imagee  */}
                <Bounce right>
                    <div className="hidden md:flex lg:flex flex-col justify-center items-center w-full h-screen">
                        <img className="w-4/4 mx-auto" src="../../assets/signup.png" alt="signup" />
                    </div>
                </Bounce>
            </div>
        </main>
    )
}

export default SignUpScreen
