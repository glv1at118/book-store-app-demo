import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { FirebaseService } from 'src/app/firebase.service';
import { collection, addDoc } from "firebase/firestore";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public registerForm = new FormGroup({
        username: new FormControl(''),
        password: new FormControl(''),
    });

    public loginForm = new FormGroup({
        username: new FormControl(''),
        password: new FormControl(''),
    });

    public addNewBookForm = new FormGroup({
        bookName: new FormControl(''),
        bookCategory: new FormControl(''),
        bookPrice: new FormControl(0)
    });

    constructor(private fireBaseService: FirebaseService) { }

    ngOnInit(): void {
        // Obtain the login with redirect credentials when page loads
        const auth = getAuth(this.fireBaseService.app);
        getRedirectResult(auth)
            .then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            });
    }

    // Create an account using email & password with firebase
    registerAccount() {
        const auth = getAuth(this.fireBaseService.app);
        const email = this.registerForm.value.username + '';
        const password = this.registerForm.value.password + '';

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Login an existing account using email & password with firebase
    loginAccount() {
        const auth = getAuth(this.fireBaseService.app);
        const email = this.loginForm.value.username + '';
        const password = this.loginForm.value.password + '';

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Login using browser's native pop up window and let user choose a gmail account
    loginWithGooglePopUp() {
        const auth = getAuth(this.fireBaseService.app);
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            });
    }

    // Login using browser's redirect feature, redirecting to a page which lets user choose a gmail account,
    // and after user chooses, redirect back to original page.
    // The login credential information can be obtained when the original page loads, namely it can be access from ngOnInit.
    loginWithGoogleRedirect() {
        const auth = getAuth(this.fireBaseService.app);
        const provider = new GoogleAuthProvider();

        signInWithRedirect(auth, provider);
    }

    async addNewBook() {
        try {
            const docRef = await addDoc(collection(this.fireBaseService.db, "books"), {
                bookName: this.addNewBookForm.value.bookName,
                bookCategory: this.addNewBookForm.value.bookCategory,
                bookPrice: this.addNewBookForm.value.bookPrice
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
}
