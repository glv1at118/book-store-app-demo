import { Injectable } from '@angular/core';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    // these firebase config values can be put in environment files
    private firebaseConfig = {
        apiKey: "AIzaSyDFbUAwbUdbSxGccRUaA8IeBHaEiLafzlY",
        authDomain: "book-store-app-e02f4.firebaseapp.com",
        projectId: "book-store-app-e02f4",
        storageBucket: "book-store-app-e02f4.appspot.com",
        messagingSenderId: "366883408393",
        appId: "1:366883408393:web:10aea32e276f45c035c6d8",
        measurementId: "G-XBVTDHSRZ2"
    };
    public app; // to be used outside app-wise
    public analytics; // to be use outside app-wise
    public db;

    constructor() {
        this.app = initializeApp(this.firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.db = getFirestore(this.app);
    }
}
