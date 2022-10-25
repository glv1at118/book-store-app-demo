Firebase is NoSQL based database hosting platform. It offers 2 types of databases:
1. Cloud Firestore 
2. Realtime Database
Cloud Firestore is a comprehensive upgrade based on Realtime Database, and it's the recommended option.

For offline capability, Realtime Database is able to monitor connection to internet, but Cloud Firestore is not.
However you can leverage Realtime Database's support for presence by syncing Cloud Firestore and Realtime Database using Cloud Functions. 

To choose between Cloud Firestore & Realtime Database:
https://firebase.google.com/docs/database/rtdb-vs-firestore?authuser=0&hl=en

Firebase storage is able to save files like Azure blob or Kinvey Files Api.
Firebase storage is able to preview the files very conveniently, and is able to pause/resume/cancel the upload process.
It's also able to return the bytes already uploaded value in a current snapshot,
which enables us to calculate how much percentage of the file is uploaded.
From the ease of use side, it's easier and more straight-forward than Kinvey file Api.

Firestore is able to listen to a particular collection on cloud, or a particular query against a collection (namely a subset of the result), in real-time.
Whenever there's data changes such as new added or deletion of document, resequencing of docs, field changes for a particular document, and etc, the listener on the client side will trigger.
We're able to know whether that new "delta" change is from local and not yet sent to firestore cloud, OR, 
if that "delta" change is retrived from the cloud side.
We're also able to know what exactly of the part of data has been changed.
This feature can be used as a replacement for kinvey's synchronization process.
Once the listener is not used anymore it needs to be unsubscribed, to release resource and bandwith.
https://firebase.google.com/docs/firestore/query-data/listen

Cloud Firestore supports offline data persistence. This feature caches a copy of the Cloud Firestore data that your app is actively using, so your app can access the data when the device is offline. You can write, read, listen to, and query the cached data. When the device comes back online, Cloud Firestore synchronizes any local changes made by your app to the Cloud Firestore backend.
