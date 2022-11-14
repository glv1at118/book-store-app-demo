import { Injectable } from '@angular/core';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, getFirestore, initializeFirestore } from "firebase/firestore";
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
    // private firebaseConfig = {
    //     apiKey: "AIzaSyAK07UXypCuiT721VoUgyRub6NHzB_87Uw",
    //     authDomain: "book-store-project-545f9.firebaseapp.com",
    //     projectId: "book-store-project-545f9",
    //     storageBucket: "book-store-project-545f9.appspot.com",
    //     messagingSenderId: "338604703495",
    //     appId: "1:338604703495:web:d4744036514eeba3ec0fa2"
    // };
    public app;
    public analytics;
    public db;
    public storage;

    constructor() {
        this.app = initializeApp(this.firebaseConfig);
        this.analytics = getAnalytics(this.app);
        // this.db = getFirestore(this.app); // Option 1: This means the firestore db is accessible only online
        this.db = initializeFirestore(this.app, { // Option 2: This means the firestore db is accessible both online & offline.
            cacheSizeBytes: CACHE_SIZE_UNLIMITED // For offline, firestore db is to be saved to IndexedDB.
        });
        this.storage = getStorage(this.app);

        // enable the offline persistence capability for firestore web app, it's going to persist to IndexedDB.
        this.enableFireStoreOfflineFeature();
    }

    // This method enables the offline capability for firestore. By default for firestore on web apps,
    // it's disabled. For apple or android native apps, it's by default enabled.
    enableFireStoreOfflineFeature() {
        enableIndexedDbPersistence(this.db)
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time');
                } else if (err.code == 'unimplemented') {
                    console.log('The current browser does not support all of the features required to enable persistence');
                }
            });
    }
}
