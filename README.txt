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