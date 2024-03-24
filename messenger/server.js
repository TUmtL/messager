const { createServer } = require('http')
const { Server } = require('socket.io')
const express = require('express')
const path = require('path')
const cors = require('cors')
// const fs = require('fs')
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    methods: ["GET", 'POST', "PATCH"],
  }
})
const accaunts = [{ name: 'admin', status: 'admin', login: 'adminadmin', password: 'adminadmin', id: 0, messagesIDList: [], path: "admin/0" }]
const messagesList = [{ id: -1, name: 'ONLY FOR TEST', messages: [{ id: -1, author: 'server', message: 'CREATED' }], localAdmin: [], path: 'messager/-1', whiteList: true, whiteListCollection: ['admin/0'] }]
const dirip = '127.0.0.1:3001'

app.use(cors())
app.use(express.static(path.relative(__dirname, 'project-nadzor')))
app.use(express.json())
io.on('connection', (socket) => {
  messagesList.forEach(el => {
    socket.emit(`messagers/${el.id}`, el)
    // socket.broadcast.emit(`messagers/${el.id}`, el)
  })
  messagesList.forEach(el => {
    socket.on(`messagers/send/${el.id}`, (res) => {
      const one = messagesList.find(Fel => Fel.id == el.id)

      one.messages.push({...res })
      // one.messages.push(res)
      socket.emit(`messagers/${el.id}`, el)
      socket.broadcast.emit(`messagers/${el.id}`, el)
      console.log(`messagers/send/${el.id}`)
      // console.log(res , `messagers/send/${el.id}`)
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
      console.log('u power lower than 10M')
    } 
  })
  socket.on('messager/edit' , (res)=>{
    const one = messagesList.find(el => el.id == res.id)
    one.localAdmin = res.localAdmin
    one.whiteList = res.whiteList
    one.whiteListCollection = res.whiteListCollection
    one.adminsWriteOnly = res.adminsWriteOnly
    socket.emit(`messagers/${res.id}`, one)
    socket.broadcast.emit(`messagers/${res.id}`, one)
    console.log( one , `messagers/${res.id}`)
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
    const messager = messagesList.find(el => el.id == req.body.findId)
    console.log([accaunt, messager])
    if (messager?.whiteList) {
      if (messager.localAdmin.find(el => el == accaunt.path) != null || accaunt.status == 'admin' || messager.whiteListCollection.find(el => el == accaunt.path) != null) {
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
    messagesList.push({ name: req.body.findId, id, messages: [{ author: 'server', id: 0, message: 'CHAT CREATED' }], localAdmin: [`${req.body.authorPath}`], path: `messager/${id}`, whiteList: req.body.whiteList, whiteListCollection: req.body.whiteListCollection, adminsWriteOnly: req.body.adminsWriteOnly })
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

httpServer.listen(3001, () => console.log('server launched, server path => 127.0.0.1:3001'))

         