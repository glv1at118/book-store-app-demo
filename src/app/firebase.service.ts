import { Injectable } from '@angular/core';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
        measurementId: "G-XBVTDHSRZ2",
    };
    public app;
    public analytics;
    public db;
    public storage;

    constructor() {
        this.app = initializeApp(this.firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.db = getFirestore(this.app);
        this.storage = getStorage(this.app);
    }
}
