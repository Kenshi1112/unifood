npm install bcryptjs jsonwebtoken
npm install cors
npm install --save-dev nodemon
npm install cloudinary multer multer-storage-cloudinary
npm install ws
npm install tesseract.js sharp express multer

```
2
   ├─ app.js
   ├─ config
   │  └─ db.js
   ├─ controllers
   │  ├─ authController.js
   │  ├─ menuController.js
   │  ├─ restaurantController.js
   │  └─ reviewController.js
   ├─ middleware
   │  ├─ auth.js
   │  └─ upload.js
   ├─ models
   │  ├─ Menu.js
   │  ├─ restaurant.js
   │  ├─ review.js
   │  └─ user.js
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ css
   │  │  └─ style.css
   │  └─ js
   │     └─ main.js
   ├─ README.md
   ├─ routes
   │  ├─ authRoutes.js
   │  ├─ menuRoutes.js
   │  ├─ restaurantRoutes.js
   │  └─ reviewRoutes.js
   ├─ upload.js
   ├─ utils
   │  └─ validation.js
   └─ views
      ├─ addRestaurant.html
      ├─ admin.html
      ├─ chat.html
      ├─ editRestaurant.html
      ├─ index.html
      ├─ login.html
      ├─ profile.html
      ├─ register.html
      ├─ restaurantDetails.html
      ├─ review.html
      ├─ search.html
      └─ signup.html

   ```