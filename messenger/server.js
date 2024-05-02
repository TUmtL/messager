const { createServer } = require('http')
const { Server } = require('socket.io')
const express = require('express')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
// const fs = require('fs')
const app = express()
app.use(cors())
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    methods: ["GET", 'POST', "PATCH"],
  }
})
const accaunts = [{ name: 'admin', status: 'admin', login: 'adminadmin', password: 'adminadmin', id: 0, messagesIDList: [], path: "admin/0" }]
const messagesList = [{ id: -1, name: 'ONLY FOR TEST', messages: [{ id: -1, author: 'server', message: 'CREATED' }], localAdmin: [], path: 'messager/-1', whiteList: true, whiteListCollection: ['admin/0'] }]

const dirip = '127.0.0.1:3001'


app.use(express.static(path.relative(__dirname, 'messenger' ,)))
app.use(express.json())
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname , 'latin1').toString('utf-8')
    cb(null, file.originalname.split(' ').join('-').toString('utf8'))
  },
  
})
// добавь возможность добовлять фото в чатах а так же в методе post/upload делать запрос в какие сообщения добовлять ссылку на изоброжение
const upload = multer({storage:storage})
 app.get('/image/:name' , (req , res) => {
  res.sendFile(path.resolve(__dirname , 'uploads' , req.params.name))
 })
app.post('/upload' , upload.single('file'), (req , res)=>{
  res.json({...req.file , path:'127.0.0.1:3001/image/' + req.file.filename})
}) 
io.on('connection', (socket) => {
  messagesList.forEach(el => {
    socket.emit(`messagers/${el.id}`, el)
    // socket.broadcast.emit(`messagers/${el.id}`, el)
  })
  messagesList.forEach(el => {
    socket.on(`messagers/send/${el.id}`, (res) => {
      const one = messagesList.find(Fel => Fel.id == el.id)
      one.messages.push({...res })
      socket.emit(`messagers/${el.id}`, el)
      socket.broadcast.emit(`messagers/${el.id}`, el)
    })
  })
  socket.on('create', (res) => { 
    socket.emit(`messagers/${res}`, messagesList.find(el => el.id == res))
    socket.removeAllListeners(`messagers/send/${res}`) 
    socket.on(`messagers/send/${res}`, (ress) => {
      const one = messagesList.find(el => el.id == res)
      one.messages.push(ress)
      socket.emit(`messagers/${res}`, one)
      socket.broadcast.emit(`messagers/${res}`, one) 
    }) 
  }) 
  socket.on('remove/message' , (res)=>{
    const messager = messagesList.find(el =>el.id == res.messagerId)
    const isALocalAdmin = messager.localAdmin.find(el => el == res.whoRemove)
    const isAGlobalAdmin = accaunts.find(el => el.path == res.whoRemove).status
    if(res.author != 'server' &&(isALocalAdmin != undefined || isAGlobalAdmin == 'admin' || res.whoRemove == res.author)) {
      messager.messages = messager.messages.filter(el => el.id != res.id)
      socket.emit(`messagers/${res.messagerId}` , messager)
      socket.broadcast.emit(`messagers/${res.messagerId}` , messager)
      console.log('delite')
    } else {
      console.log('ur power lower than 10M')
    } 
  })
  socket.on('messager/edit' , (res)=>{
    const one = messagesList.find(el => el.id == res.id)
    one.localAdmin = res.localAdmin
    one.whiteList = res.whiteList
    one.whiteListCollection = res.whiteListCollection
    one.adminsWriteOnly = res.adminsWriteOnly
    one.blackList = res.blackList
    socket.emit(`messagers/${res.id}`, one)
    socket.broadcast.emit(`messagers/${res.id}`, one)
    // console.log( one , `messagers/${res.id}`)
  })
  socket.on('message/edit' , (res)=>{
    const messager = messagesList.find(el => el.id == res.messagerId)
    const message = messager.messages.find(el => el.id == res.id)
    if(res.whoEdit == message.author){
      message.message = res.value
      message.redact = true
      socket.emit(`messagers/${messager.id}`, messager)
      socket.broadcast.emit(`messagers/${messager.id}`, messager)
    }
  })
})
app.get('/messager/:id', (req, res) => {
  res.json(messagesList.find(el => el.id == req.params.id)) 
})
app.post('/messager/:id', (req, res) => {
  const test = messagesList.find(el => el.id == req.params.id) 
  test.messages.push({ ...req.body, id: test.messages[test.messages.length - 1].id + 1 })
  res.json({ messageStatus: "true", message: test.messages.length })
  // console.log(test)
})
app.post('/messager', (req, res) => {
  const accaunt = accaunts.find(el => el.path == req.body.authorPath)
  if (req.body.method == 'get') {
    //blaklist
    const messager = messagesList.find(el => el.id == req.body.findId)
    console.log([accaunt, messager])
    if (messager?.whiteList) {
      if ((messager.localAdmin.find(el => el == accaunt.path) != null || accaunt.status == 'admin' || messager.whiteListCollection.find(el => el == accaunt.path) != null)) { 
        accaunt.messagesIDList.push(messager.id)
        accaunt.messagesIDList = [...new Set(accaunt.messagesIDList)]
        res.json(accaunt.messagesIDList)
      }
    } else if(messager?.blackList.length > 0){
      if(messager.blackList.find(el => el == accaunt.path) == null || accaunt.status == 'admin'){
        accaunt.messagesIDList.push(messager.id)
        accaunt.messagesIDList = [...new Set(accaunt.messagesIDList)]
        res.json(accaunt.messagesIDList)
      }
    } else {
      accaunt.messagesIDList.push(messager.id)
      accaunt.messagesIDList = [...new Set(accaunt.messagesIDList)]
      res.json(accaunt.messagesIDList)
    }
  }
  if (req.body.method == 'create') {
    const id = messagesList[messagesList.length - 1].id + 1
    //blaklist
    messagesList.push({ name: req.body.findId, id, messages: [{ author: 'server', id: 0, message: 'CHAT CREATED' }], localAdmin: [`${req.body.authorPath}`], path: `messager/${id}`, whiteList: req.body.whiteList, whiteListCollection: req.body.whiteListCollection, adminsWriteOnly:req.body.adminsWriteOnly, blackList:[] })
    accaunt.messagesIDList.push(id)
    // console.log(req.body)
    res.json(accaunt.messagesIDList)
  }
  console.log(messagesList)
})
app.post('/signin', (req, res) => {
  if (req.body.login.length >= 5 && accaunts.find(el => el.login === req.body.login) == null && req.body.password.length > 6 && req.body.name.length != 0) {
    accaunts.push({ ...req.body, status: 'user', id: accaunts[accaunts.length - 1].id + 1, messagesIDList: [], path: `${req.body.name}/${accaunts[accaunts.length - 1].id + 1}` })
    res.json({ accaunt: true, message: 'Аккаунт зарегестрирован!', path: `${req.body.name}/${accaunts[accaunts.length - 1].id}` })
    console.log(req.body, `/${req.body.name}/${req.body.id}`)
  } else {
    res.json({ accaunt: false, message: 'Аккаунт регестрировался ранее или вы ввели не верно пороль или логин' })
  }
  accaunts.forEach((element, i) => {
    console.log(element)
  });
})
app.post('/login', (req, res) => {
  if (accaunts.find(el => el.login === req.body.login && el.password === req.body.password) != null) {
    const path = `${accaunts.find(el => el.login === req.body.login && el.password === req.body.password).name}/${accaunts.find(el => el.login === req.body.login && el.password === req.body.password).id}`
    res.json({ accaunt: true, message: 'Вы вошли в аккаунт!', path })
  } else {
    res.json({ accaunt: false, message: 'Вы НЕ вошли в аккаунт!' })
  }
})
app.get(`/:name/:id`, (req, res) => {
  res.json(accaunts.find(el => { return el['name'] == req.params['name'] && el['id'] == req.params['id'] }))
})
app.put('/leave' , (req , res) =>{
  const user = accaunts.find(el => el.path == req.body.whoOut)
  user.messagesIDList = user.messagesIDList.filter(el => el != req.body.messagerId)
  console.log(req.body , user)
})
app.get('/info/:name/:id' , (req, res) =>{
  const user = accaunts.find(el => el.id == req.params.id)
  res.json({name:user.name , status:user.status , path:user.path , date:user.date})   
})
app.post('/edit/:name/:id' , (req , res)=>{
  const accaunt = accaunts.find(el => el.path == req.body.whoEdit && el.password == req.body.whoEditPassword)
  if(accaunt != undefined && accaunts.find(el => el.login == req.body.login) == undefined && req.body.login.length > 4 && req.body.password.length > 6) {
    accaunt.password = req.body.password
    accaunt.login = req.body.login
    res.json({login:accaunt.login , password:accaunt.password, status:"ok"})
  } else res.json({login:'error' , password:'error', status:"bad"})
  console.log(req.body , accaunt)
})
httpServer.listen(3001, () => console.log('server launched, server path => 127.0.0.1:3001'))