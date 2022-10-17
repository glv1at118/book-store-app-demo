import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FirebaseService } from 'src/app/firebase.service';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

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

    constructor(private fireBaseService: FirebaseService) { }

    ngOnInit(): void {
    }

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
}
