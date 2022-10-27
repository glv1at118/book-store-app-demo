import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ref } from '@firebase/storage';
import { createUserWithEmailAndPassword, getAuth, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where, disableNetwork, enableNetwork, DocumentData } from "firebase/firestore";
import { getDownloadURL, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { FirebaseService } from 'src/app/firebase.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

    public registerForm = new FormGroup({
        email: new FormControl(''),
        password: new FormControl(''),
    });

    public loginForm = new FormGroup({
        email: new FormControl(''),
        password: new FormControl(''),
    });

    public addNewBookForm = new FormGroup({
        bookName: new FormControl(''),
        bookCategory: new FormControl(''),
        bookPrice: new FormControl(0)
    });

    public fileChosen: any = null;
    public storageRef: any = null;
    public uploadValue: string = '';

    // listener set on client side, to listen for changes on a particular db collection, or db query on firestore cloud.
    public realTimeUpdatesUnsubscriber: any = null;

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

        // listen for real-time updates for a firestore db collection or specific query.
        this.monitorBookCollectionRealTimeUpdates();
    }

    ngOnDestroy(): void {
        // release the listener resource and internet bandwidth.
        this.realTimeUpdatesUnsubscriber.unsubscribe();
    }

    // Create an account using email & password with firebase
    registerAccount() {
        const auth = getAuth(this.fireBaseService.app);
        const email = this.registerForm.value.email + '';
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
        const email = this.loginForm.value.email + '';
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

    // Add a new document record into the target NoSQL collection in firestore db.
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

    // Read all the document records from the firestore db.
    async getAllBooks() {
        console.time('get-all');
        const querySnapshot = await getDocs(collection(this.fireBaseService.db, "books"));
        const booksArray: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
            booksArray.push(doc.data());
        });
        console.log(booksArray);
        console.log('data is retrieved from cache: ', querySnapshot.metadata.fromCache);
        console.timeEnd('get-all');
    }

    // Read a specific book from the document records.
    async getSpecificBook() {
        const q = query(collection(this.fireBaseService.db, "books"), where("bookName", "==", "History of Ancient Greece"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
        });
    }

    // Update an existing document record in the firestore db.
    async updateExistingBook() {
        const documentRef = doc(this.fireBaseService.db, "books", "259Jx8uRMfvjOpPy4S5D");
        await updateDoc(documentRef, {
            bookName: "History of Ancient America",
            bookPrice: "65"
        });
    }

    // Delete an existing document from the firestore db collection.
    async deleteExistingBook() {
        const documentRef = doc(this.fireBaseService.db, "books", "ZDv5gNJjzkiM0GEbMsCB");
        await deleteDoc(documentRef);
    }

    // When a file is chosen from the <input> element on page, it passes the file to the fileChosen field member.
    getFileObject(event: any) {
        this.fileChosen = event.target.files[0];
        console.log(this.fileChosen);
    }

    // Upload the file chosen from input element, to firebase storage.
    uploadFile() {
        this.storageRef = ref(this.fireBaseService.storage, `files/${this.fileChosen.name}`);
        const uploadTask: UploadTask = uploadBytesResumable(this.storageRef, this.fileChosen);
        uploadTask.on('state_changed', {
            next(snapShot) {
                console.log('Uploading: ' + snapShot.bytesTransferred / snapShot.totalBytes * 100 + ' %');
            },
            error(error) {
                console.log(error);
            },
            complete() {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    console.log(`Upload completes, access the file at ${url}`);
                });
            }
        });
    }

    // Monitor the real-time updates for the Book collection in firestore db.
    monitorBookCollectionRealTimeUpdates() {
        const q = query(collection(this.fireBaseService.db, "books"));
        this.realTimeUpdatesUnsubscriber = onSnapshot(q, (querySnapshot) => {
            // const books: any[] = [];
            // querySnapshot.forEach((doc) => {
            //     books.push(doc.data());
            // });
            // console.log("All books on firestore cloud: ", books);

            // // here is to find out what exactly the part of data has been changed.
            // querySnapshot.docChanges().forEach((change) => {
            //     if (change.type === "added") {
            //         console.log("Book added: ", change.doc.data());
            //     }
            //     if (change.type === "modified") {
            //         console.log("Book modified: ", change.doc.data());
            //     }
            //     if (change.type === "removed") {
            //         console.log("Book removed: ", change.doc.data());
            //     }
            // });
            console.log(`local data is updated with firestore cloud data.`, querySnapshot);
        });
        // so after the "onSnapshot" listener is running, any changes on the books collection on firestore,
        // will trigger the console.log printing on client side. --> This can be used like kinvey sync.
    }

    // This disables the app's connection to firestore cloud db. The internet connection is not affected.
    async disableFirestoreConnect() {
        await disableNetwork(this.fireBaseService.db);
        console.log("Connection to firestore is disabled.");
    }

    // This enables the app's connection to firestore cloud db. The internet connection is not affected.
    async enableFirestoreConnect() {
        await enableNetwork(this.fireBaseService.db);
        console.log("Connection to firestore is enabled.");
    }

    async insertMassiveData() {
        for (let i = 0; i < 10000; i++) {
            let bookName = `Test Book ${i}`;
            let bookCategory = `Test Book Category ${i}`;
            let bookPrice = i + 1;
            let bookIntro = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`
            };
            let docRef = await addDoc(collection(this.fireBaseService.db, "books"), {
                bookName,
                bookCategory,
                bookPrice,
                bookIntro
            });
            console.log("Document written with ID: ", docRef.id);
        }
    }
}
