const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const getAuth = require('./validateUser').getAuth
const app = express()

// enable files upload
app.use(fileUpload({
  createParentPath: true
}))

//add other middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(express.static('uploads'))

//start app 
const port = process.env.PORT || 7000

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
)

app.post('/upload-file', async (req, res) => {
  try {

    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
     
      //Use the name of the input field (i.e. 'audiofile') to retrieve the uploaded file         
      let audiofile = req.files.audiofile
      let folder = req.body.folder || 'uploads'     
      let id =  req.body.clientId
      let secret =  req.body.clientSecret
      let issuer =  req.body.issuer
      let resource =  req.body.resource
      const auth = await getAuth(id, secret, issuer, resource)
      //console.log(auth.status) // if status === 200 upload file
      console.log(auth)
      //Use the mv() method to place the file in the upload directory (i.e. 'uploads')      
      audiofile.mv('./' + folder + '/' + audiofile.name)

      //send response
      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: audiofile.name,
          mimetype: audiofile.mimetype,
          size: audiofile.size
        }
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})
