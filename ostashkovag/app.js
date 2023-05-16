require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const pg = require('pg');
const fs = require("fs");
const coockieParser = require("cookie-parser");

const jsonParser = express.json();
const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(coockieParser());

const eventRouter = require('./routes/eventRouter');
const userRouter = require('./routes/userRouter');
const newRouter = require('./routes/newRouter');
const issueRouter = require('./routes/issueRouter');


app.use('/api/new', newRouter);
app.use('/api/event', eventRouter);
app.use('/api/user', userRouter);
app.use('/api/issue', issueRouter);

app.post('/api/user/event/tracker/add', jsonParser, (request, response) => {
    const id = response.locals.id;
    var { event_id } = request.body;

    var query = `INSERT INTO public."EventUserTracking"
    (id_event, id_user) VALUES
    (${event_id}, ${id});`;

    pool.query(query, (err, res) => {
        if(err){
            console.log(err);
            response.status(404);
            return;
        }
        response.status(200).send({text: "success"})
    });

});

app.get('/api/user/event/tracker', jsonParser, (request, response) => {
    const id = response.locals.id;
    
    var query = `SELECT ev.id, ev.name, ev.description,
    ev.datebegin, ev.datefinal, ev.type, ms.name AS photo,
    mse.order_rows FROM public."User" AS us
    INNER JOIN public."EventUserTracking" AS eut ON
    us.id = eut.id_user INNER JOIN public."Event" AS ev 
    ON eut.id_event = ev.id
    INNER JOIN public."MediaStorageEvent" AS mse
    ON mse.id_event = ev.id
    INNER JOIN public."MediaStorage" AS ms
    on ms.id = mse.id_media
	  WHERE us.id = ${id};`;

    pool.query(query, (err, res)=>{
        if(err){
            console.log(err);
            response.status(404);
            return;
        }

        var result = parseEventRowsByPhothos(res.rows)

        response.status(200).send(result);
    });

});

app.delete('/api/user/event/tracker/delete', jsonParser, (request, response) => {
    const id = response.locals.id;

    var { event_id } = request.body;
    
    var query = `DELETE FROM public."EventUserTracking"
    WHERE id_user = ${id} AND id_event = ${event_id};`;

    pool.query(query, (err, res)=>{
        if(err){
            console.log(err);
            response.status(404);
            return;
        }
        response.status(200).send({text: "success"});
    });
});

app.post('/api/user/event/request/add', jsonParser, (request, response) => {
  const id = response.locals.id;

  var { name, datebegin, datefinal, description, type } = request.body;
  
  var query = `INSERT INTO public."EventRequest"
  (name, datebegin, datefinal, description, id_user, type) VALUES
  ('${name}', `;

  if(datebegin) query += `'${datebegin}', `; else query += `NULL, `;
  if(datefinal) query += `'${datefinal}', `; else query += `NULL, `;

  query += `'${description}', ${id}, '${type}');`;

  pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }
      response.status(200).send({text: "success"});
  });
});



app.get('/api/admin/event/request/get', jsonParser,(request, response) => {
      var query = `SELECT * FROM public."EventRequest" AS er
      LEFT JOIN public."User" AS u on er.id_user = u.id;`;

      pool.query(query, (err, res) => {
          if(err){
            console.log(err);
            response.status(404);
            return;
          }
          response.status(200).send(res.rows);
      });
});

app.post('/api/user/issue/add', jsonParser, (request, response) => {
  const id = response.locals.id;

  var { type, description } = request.body;
  
  var query = `INSERT INTO public."IssueRequest"
  (type, description, id_user) VALUES
  ('${type}', '${description}', ${id});`;

  pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }
      response.status(200).send({text: "success"});
  });
});

app.get('/api/event/date', jsonParser,(request, response) =>{

  var {date} = request.body;

  var query = `SELECT ev.id, ev.name, ev.description, ev.address,
  ev.datebegin, ev.datefinal, ev.type, ms.name 
  AS photo FROM public."Event" AS ev
  INNER JOIN public."MediaStorageEvent" AS mse
  ON ev.id = mse.id_event
  INNER JOIN public."MediaStorage" AS ms
  ON ms.id = mse.id_media
  WHERE DATE(${date ? `'${date}'` : `NOW()`}) = DATE(ev.datebegin)
  AND mse.order_rows = 1;`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }
    response.status(200).send(res.rows);
  });

});

app.get('/api/admin/issue/get', jsonParser, (request, response) => {
  
  var query = `SELECT * FROM public."IssueRequest" AS ir
  LEFT JOIN public."User" AS u on ir.id_user = u.id;`;

  pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }
      response.status(200).send(res.rows);
  });
});


app.get("/api/public/*", (req, res, next) => {
  res.sendFile("uploads/" + req.path.substring(12).replace('%20', ' '), { root: __dirname });
});


app.listen(PORT);


// main();


