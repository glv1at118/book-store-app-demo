import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ref } from '@firebase/storage';
import { createUserWithEmailAndPassword, getAuth, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, disableNetwork, doc, DocumentData, enableNetwork, getDocs, getDocsFromCache, getDocsFromServer, onSnapshot, query, updateDoc, where, writeBatch } from "firebase/firestore";
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

        // this.heartBeatCachedDbUpdateRunner();

        // The "onAuthStateChanged" listener listens for authentication status.
        // Whenever there's a change it will trigger, namely it will trigger when user signs in or logs out.
        onAuthStateChanged(auth, (data) => {
            if (data) {
                console.log("You are logged in!");
            } else {
                console.log("You are not logged in!");
            }
        });
    }

    ngOnDestroy(): void {
        // release the listener resource and internet bandwidth.
        this.realTimeUpdatesUnsubscriber();
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

    // logs out the current active user
    logoutAccount() {
        const auth = getAuth(this.fireBaseService.app);
        signOut(auth);
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

    async getAllBooksFromCache() {
        console.time('get from cache time used');
        const querySnapshot = await getDocsFromCache(collection(this.fireBaseService.db, "books"));
        console.timeEnd('get from cache time used');
        const booksArray: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
            booksArray.push(doc.data());
        });
        console.log(booksArray);
        console.log('data is retrieved from cache: ', querySnapshot.metadata.fromCache);
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

    async doBatchedWrite() {
        const batch = writeBatch(this.fireBaseService.db);
        for (let i = 0; i < 450; i++) {
            let documentRef = doc(this.fireBaseService.db, "books", "id_" + new Date().getMilliseconds() + Math.random());
            let data: any = {
                bookName: `Test Book ${i}`,
                bookCategory: `Test Book Category ${i}`,
                bookPrice: i + 1,
                bookIntro1: {
                    introTitle: `introTitle ${i}`,
                    introText: `introText ${i}`,
                    bookPublish: new Date().getMilliseconds(),
                    bookJsonObject: {
                        property1: `field-property-${i}`,
                        property2: `field-property-${i + 1}`,
                        property3: `field-property-${i + 2}`,
                        property4: `field-property-${i + 3}`,
                        property5: `field-property-${i + 4}`,
                        property6: `field-property-${i + 5}`,
                        property7: `field-property-${i + 6}`,
                        property8: `field-property-${i + 7}`,
                        property9: `field-property-${i + 8}`,
                        property10: `field-property-${i + 9}`,
                        property11: `field-property-${i + 10}`,
                        property12: `field-property-${i + 11}`,
                        property13: `field-property-${i + 12}`,
                        property14: `field-property-${i + 13}`,
                        property15: `field-property-${i + 14}`,
                        property16: `field-property-${i + 15}`,
                        property17: `field-property-${i + 16}`,
                        property18: `field-property-${i + 17}`,
                        property19: `field-property-${i + 18}`,
                        property20: `field-property-${i + 19}`,
                    }
                },
                bookIntro2: {
                    introTitle: `introTitle ${i}`,
                    introText: `introText ${i}`,
                    bookPublish: new Date().getMilliseconds(),
                    bookJsonObject: {
                        property1: `field-property-${i}`,
                        property2: `field-property-${i + 1}`,
                        property3: `field-property-${i + 2}`,
                        property4: `field-property-${i + 3}`,
                        property5: `field-property-${i + 4}`,
                        property6: `field-property-${i + 5}`,
                        property7: `field-property-${i + 6}`,
                        property8: `field-property-${i + 7}`,
                        property9: `field-property-${i + 8}`,
                        property10: `field-property-${i + 9}`,
                        property11: `field-property-${i + 10}`,
                        property12: `field-property-${i + 11}`,
                        property13: `field-property-${i + 12}`,
                        property14: `field-property-${i + 13}`,
                        property15: `field-property-${i + 14}`,
                        property16: `field-property-${i + 15}`,
                        property17: `field-property-${i + 16}`,
                        property18: `field-property-${i + 17}`,
                        property19: `field-property-${i + 18}`,
                        property20: `field-property-${i + 19}`,
                    }
                },
                bookIntro3: {
                    introTitle: `introTitle ${i}`,
                    introText: `introText ${i}`,
                    bookPublish: new Date().getMilliseconds(),
                    bookJsonObject: {
                        property1: `field-property-${i}`,
                        property2: `field-property-${i + 1}`,
                        property3: `field-property-${i + 2}`,
                        property4: `field-property-${i + 3}`,
                        property5: `field-property-${i + 4}`,
                        property6: `field-property-${i + 5}`,
                        property7: `field-property-${i + 6}`,
                        property8: `field-property-${i + 7}`,
                        property9: `field-property-${i + 8}`,
                        property10: `field-property-${i + 9}`,
                        property11: `field-property-${i + 10}`,
                        property12: `field-property-${i + 11}`,
                        property13: `field-property-${i + 12}`,
                        property14: `field-property-${i + 13}`,
                        property15: `field-property-${i + 14}`,
                        property16: `field-property-${i + 15}`,
                        property17: `field-property-${i + 16}`,
                        property18: `field-property-${i + 17}`,
                        property19: `field-property-${i + 18}`,
                        property20: `field-property-${i + 19}`,
                    }
                },
                bookIntro4: {
                    introTitle: `introTitle ${i}`,
                    introText: `introText ${i}`,
                    bookPublish: new Date().getMilliseconds(),
                    bookJsonObject: {
                        property1: `field-property-${i}`,
                        property2: `field-property-${i + 1}`,
                        property3: `field-property-${i + 2}`,
                        property4: `field-property-${i + 3}`,
                        property5: `field-property-${i + 4}`,
                        property6: `field-property-${i + 5}`,
                        property7: `field-property-${i + 6}`,
                        property8: `field-property-${i + 7}`,
                        property9: `field-property-${i + 8}`,
                        property10: `field-property-${i + 9}`,
                        property11: `field-property-${i + 10}`,
                        property12: `field-property-${i + 11}`,
                        property13: `field-property-${i + 12}`,
                        property14: `field-property-${i + 13}`,
                        property15: `field-property-${i + 14}`,
                        property16: `field-property-${i + 15}`,
                        property17: `field-property-${i + 16}`,
                        property18: `field-property-${i + 17}`,
                        property19: `field-property-${i + 18}`,
                        property20: `field-property-${i + 19}`,
                    }
                },
                bookIntro5: {
                    introTitle: `introTitle ${i}`,
                    introText: `introText ${i}`,
                    bookPublish: new Date().getMilliseconds(),
                    bookJsonObject: {
                        property1: `field-property-${i}`,
                        property2: `field-property-${i + 1}`,
                        property3: `field-property-${i + 2}`,
                        property4: `field-property-${i + 3}`,
                        property5: `field-property-${i + 4}`,
                        property6: `field-property-${i + 5}`,
                        property7: `field-property-${i + 6}`,
                        property8: `field-property-${i + 7}`,
                        property9: `field-property-${i + 8}`,
                        property10: `field-property-${i + 9}`,
                        property11: `field-property-${i + 10}`,
                        property12: `field-property-${i + 11}`,
                        property13: `field-property-${i + 12}`,
                        property14: `field-property-${i + 13}`,
                        property15: `field-property-${i + 14}`,
                        property16: `field-property-${i + 15}`,
                        property17: `field-property-${i + 16}`,
                        property18: `field-property-${i + 17}`,
                        property19: `field-property-${i + 18}`,
                        property20: `field-property-${i + 19}`,
                    }
                },
            };
            batch.set(documentRef, data);
        }
        await batch.commit();
        console.log('Batch write is complete!');
    }

    async insertChunkOfData() {
        for (let i = 0; i < 100; i++) {
            let bookName = `Test Book ${i}`;
            let bookCategory = `Test Book Category ${i}`;
            let bookPrice = i + 1;
            let bookIntro = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`,
                bookPublish: new Date().getMilliseconds(),
                bookJsonObject: {
                    property1: `field-property-${i}`,
                    property2: `field-property-${i + 1}`,
                    property3: `field-property-${i + 2}`,
                    property4: `field-property-${i + 3}`,
                    property5: `field-property-${i + 4}`,
                    property6: `field-property-${i + 5}`,
                    property7: `field-property-${i + 6}`,
                    property8: `field-property-${i + 7}`,
                    property9: `field-property-${i + 8}`,
                    property10: `field-property-${i + 9}`,
                    property11: `field-property-${i + 10}`,
                    property12: `field-property-${i + 11}`,
                    property13: `field-property-${i + 12}`,
                    property14: `field-property-${i + 13}`,
                    property15: `field-property-${i + 14}`,
                    property16: `field-property-${i + 15}`,
                    property17: `field-property-${i + 16}`,
                    property18: `field-property-${i + 17}`,
                    property19: `field-property-${i + 18}`,
                    property20: `field-property-${i + 19}`,
                }
            };
            let bookIntro2 = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`,
                bookPublish: new Date().getMilliseconds(),
                bookJsonObject: {
                    property1: `field-property-${i}`,
                    property2: `field-property-${i + 1}`,
                    property3: `field-property-${i + 2}`,
                    property4: `field-property-${i + 3}`,
                    property5: `field-property-${i + 4}`,
                    property6: `field-property-${i + 5}`,
                    property7: `field-property-${i + 6}`,
                    property8: `field-property-${i + 7}`,
                    property9: `field-property-${i + 8}`,
                    property10: `field-property-${i + 9}`,
                    property11: `field-property-${i + 10}`,
                    property12: `field-property-${i + 11}`,
                    property13: `field-property-${i + 12}`,
                    property14: `field-property-${i + 13}`,
                    property15: `field-property-${i + 14}`,
                    property16: `field-property-${i + 15}`,
                    property17: `field-property-${i + 16}`,
                    property18: `field-property-${i + 17}`,
                    property19: `field-property-${i + 18}`,
                    property20: `field-property-${i + 19}`,
                }
            };
            let bookIntro3 = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`,
                bookPublish: new Date().getMilliseconds(),
                bookJsonObject: {
                    property1: `field-property-${i}`,
                    property2: `field-property-${i + 1}`,
                    property3: `field-property-${i + 2}`,
                    property4: `field-property-${i + 3}`,
                    property5: `field-property-${i + 4}`,
                    property6: `field-property-${i + 5}`,
                    property7: `field-property-${i + 6}`,
                    property8: `field-property-${i + 7}`,
                    property9: `field-property-${i + 8}`,
                    property10: `field-property-${i + 9}`,
                    property11: `field-property-${i + 10}`,
                    property12: `field-property-${i + 11}`,
                    property13: `field-property-${i + 12}`,
                    property14: `field-property-${i + 13}`,
                    property15: `field-property-${i + 14}`,
                    property16: `field-property-${i + 15}`,
                    property17: `field-property-${i + 16}`,
                    property18: `field-property-${i + 17}`,
                    property19: `field-property-${i + 18}`,
                    property20: `field-property-${i + 19}`,
                }
            };
            let bookIntro4 = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`,
                bookPublish: new Date().getMilliseconds(),
                bookJsonObject: {
                    property1: `field-property-${i}`,
                    property2: `field-property-${i + 1}`,
                    property3: `field-property-${i + 2}`,
                    property4: `field-property-${i + 3}`,
                    property5: `field-property-${i + 4}`,
                    property6: `field-property-${i + 5}`,
                    property7: `field-property-${i + 6}`,
                    property8: `field-property-${i + 7}`,
                    property9: `field-property-${i + 8}`,
                    property10: `field-property-${i + 9}`,
                    property11: `field-property-${i + 10}`,
                    property12: `field-property-${i + 11}`,
                    property13: `field-property-${i + 12}`,
                    property14: `field-property-${i + 13}`,
                    property15: `field-property-${i + 14}`,
                    property16: `field-property-${i + 15}`,
                    property17: `field-property-${i + 16}`,
                    property18: `field-property-${i + 17}`,
                    property19: `field-property-${i + 18}`,
                    property20: `field-property-${i + 19}`,
                }
            };
            let bookIntro5 = {
                introTitle: `introTitle ${i}`,
                introText: `introText ${i}`,
                bookPublish: new Date().getMilliseconds(),
                bookJsonObject: {
                    property1: `field-property-${i}`,
                    property2: `field-property-${i + 1}`,
                    property3: `field-property-${i + 2}`,
                    property4: `field-property-${i + 3}`,
                    property5: `field-property-${i + 4}`,
                    property6: `field-property-${i + 5}`,
                    property7: `field-property-${i + 6}`,
                    property8: `field-property-${i + 7}`,
                    property9: `field-property-${i + 8}`,
                    property10: `field-property-${i + 9}`,
                    property11: `field-property-${i + 10}`,
                    property12: `field-property-${i + 11}`,
                    property13: `field-property-${i + 12}`,
                    property14: `field-property-${i + 13}`,
                    property15: `field-property-${i + 14}`,
                    property16: `field-property-${i + 15}`,
                    property17: `field-property-${i + 16}`,
                    property18: `field-property-${i + 17}`,
                    property19: `field-property-${i + 18}`,
                    property20: `field-property-${i + 19}`,
                }
            };
            let docRef = await addDoc(collection(this.fireBaseService.db, "books"), {
                bookName,
                bookCategory,
                bookPrice,
                bookIntro,
                bookIntro2,
                bookIntro3,
                bookIntro4,
                bookIntro5
            });
            console.log("Document written with ID: ", docRef.id);
        }
    }

    // Monitor the real-time updates for the Book collection in firestore db.
    // Once it's called, the client will listen for real-time updates for a firestore db collection or specific query.
    // and then correspondingly update the local cached db.
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

            // the observable stream, as said by the doc, is a never ending stream, so it'll never completes.
            // so from here we cannot tell when the local db update is finished.
            console.log(`local data is updated with firestore cloud data.`, querySnapshot);
        });
        // so after the "onSnapshot" listener is running, any changes on the books collection on firestore,
        // will trigger the console.log printing on client side. --> This can be used like kinvey sync.
    }

    heartBeatCachedDbUpdateRunner() {
        // assume that this timer runs every 20 secs --> so it's mocking delta-sync every 10 mins in MRS
        window.setInterval(async () => {
            // it gets the data of interest from server and update the local db asynchronously.
            // const queryOfInterest = query(collection(this.fireBaseService.db, "books"), where("bookCategory", "==", "test class"));
            // await getDocsFromServer(queryOfInterest);

            await getDocsFromServer(collection(this.fireBaseService.db, "books"));
            console.log('local cached db is fully up-to-date');
        }, 1000 * 20);
    }

    async getDocsFromServerTest() {
        console.time('get massive docs');
        let result = await getDocsFromServer(collection(this.fireBaseService.db, "books"));
        console.timeEnd('get massive docs');
        let arr: any[] = [];
        result.forEach((value) => {
            arr.push(value.data());
        });
        console.log(arr);
    };
}
