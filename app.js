const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors  = require('cors')

const app = express();
const port = 8080;


// importan middlewares


app.use(cors());
app.use( "/" , express.static('/public'));
app.use('/', express.static(__dirname + '/public'));






/// file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});


const upload = multer({ storage: storage });




// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/" , express.static("/public"))
app.use(bodyParser.json());
// MongoDB connection string
// const mongoDB = 'mongodb+srv://asim:mardan8110@cluster0.btwlh.mongodb.net/ahmad?retryWrites=true&w=majority'; // Replace 'myDb' with your actual database name
const mongoDB = 'mongodb://127.0.0.1:27017/cst2120?retryWrites=true&w=majority';



// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

// Rest of your express server code



//posts schema
const articleSchema = new mongoose.Schema({
    user : {
      type : mongoose.Types.ObjectId , ref : "User"
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String,
    }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);



const userschema = new mongoose.Schema({
    fullname: {
        type: String
    },
    email: {
        type: String,
    }, 
    phone: {
        type: String,
    }, 
    password: {
        type: String,
    }, 
}, { timestamps: true });

const User = mongoose.model('User', userschema);




// get route to send  all articles from the db
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



// register user
app.post("/register",    async(req ,res) =>{
    try {
        console.log(req.body)
        const { email , fullname , phone, password} = req.body
        const  body = await User({
            email,
            fullname,
            phone,
            password
        }).save()
        
        res.json(body)
    } catch (error) {
        res.status(500).send("internal server error !")

    }

})



// login user
app.post("/login", async(req ,res) =>{
    console.log(req.body)
    try {
        const { email  , password} = req.body
        const user = await User.findOne({email})
        if(user &&  user.password.toUpperCase() === password.toUpperCase()){
            res.json(user)
        }
        else{
            res.status(401).send("invalid login credentials ")
        }
       
    } catch (error) {
        console.log({error})
        res.status(500).send("internal server error !")

    }

})



 // get all posts
app.get('/M00873836',  async (req, res) => {
  try {
    const allArticles = await Article.find().populate("user")
    res.json(allArticles)
    
  } catch (error) {
    res.status(500).send("internal server error !")
  }
});




// get all posts of a specific user
app.get('/users/:userId',  async (req, res) => {
  try {
    const allArticles = await Article.find({user : req.params.userId}).populate("user")
    res.json(allArticles)
    
  } catch (error) {
    res.status(500).send("internal server error !")
  }
});



// add new post
app.post('/M00873836', upload.single("image"), async (req, res) => {

try {
    


    console.log(req.body); // Log the request body to the console
    const body = Article({
        title: req.body.title,
        user : req.body.userId,
        description : req.body.description,
        image: req.file && `/uploads/${req.file.filename}` || null
    })

    await body.save()
    console.log({ body })
    res.json({ message: 'Form submitted successfully!', received: req.body });

} catch (error) {
    res.status(500).send("internal server error !")

}
});




  




app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
