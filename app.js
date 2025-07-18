require('dotenv').config(); 
const path=require('path');
const { default: mongoose } = require('mongoose');
const express=require("express");
const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const hostRouter=require("./routes/host");
const userRouter=require("./routes/user");
const authRouter=require("./routes/auth")
const rootDir= require('./utils/pathutils');
const errorController=require('./controllers/error');

const app=express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
app.set('view engine','ejs');
app.set('views','views');   //default value views he hoti hai tho if not written then also ok
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: 'sessions'
});


app.use(express.urlencoded())       //To parse body-It is very imp in express to parse body for it to understand Post req
app.use(session({
  secret: "Airbnb Project is Key",
  resave: false,
  saveUninitialized: true,
  store:store,
}));
app.use((req,res,next)=>{
   req.isLoggedIn=req.session.isLoggedIn;
   next();
})
app.use(authRouter);
app.use(userRouter);
app.use("/host",(req,res,next)=>{
if(req.isLoggedIn){
   next();
}
else{
   res.redirect("/login");
}
});


app.use(hostRouter);
app.use(express.static(path.join(rootDir,'public')));

app.use(errorController.pageNotFound);


mongoose.connect(MONGO_URL).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});
