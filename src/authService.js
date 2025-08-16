import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from './firebaseConfig'

//Resgister User
export const resgisterUser = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
}

//Login
export const loginUser = async (email, password) => { 
    return await signInWithEmailAndPassword(auth, email, password);
}

//Logout
export const logoutUser = async () => {
    return await signOut(auth);
}

