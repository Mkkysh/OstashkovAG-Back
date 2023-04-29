const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const pg = require('pg');

const jsonParser = express.json();
const PORT = 3000;
const app = express();


const config = {
    host: 'localhost',
    user: 'postgres',     
    password: 'root',
    database: 'Ostashkov-AG',
    port: 5432,
    ssl: false
};

const client = new pg.Client(config);
const pool = new pg.Pool(config);

app.post('/api/getEvents', jsonParser, (request, response) => {
    var {page, sort} = request.body;
    page = !page ? 0 : page;
    sort = !sort ? "DESC" : sort;
    const countEvents = 2;
    var countPage;

    var query = `SELECT * From public."Event"
                WHERE isarchive = false
                ORDER BY datebegin ${sort}
                LIMIT ${countEvents}
                OFFSET ${countEvents*page};`;
    
    var queryCount = `SELECT * From public."Event"
    WHERE isarchive = false;`;

    pool.query(queryCount, (err, res)=>{
        if(err) {
                console.log(err);
                response.status(404);
                return;
        }
        countPage = Math.ceil(res.rowCount/countEvents);
    })

    pool.query(query, (err, res)=>{
        if(err) {
            console.log(err);
            response.status(404);
            return;
        }
        response.status(200).send({events: res.rows, countPage: countPage});
    })
});

app.post('/api/login' , jsonParser, (request, response) => {
    var { email, password } = request.body;

    var query = `SELECT * FROM public."User"
    WHERE email like '${email}';`;

    pool.query(query, (err, res)=>{
    if(err) {
        console.log(err);
        response.status(404);
        return;
    }
    if(res.rows &&
    res.rows[0] &&
    res.rows[0]?.email == email,
    res.rows[0]?.password == password) {
        const code = jwt.sign(
            { login: email },
            "MIREAfan",
            { expiresIn: 24 * 60 * 60 },
            (err, token) => {
              response.status(200).send({ key: token, role: res.rows[0].role });
            }
        );
    }
    else response.status(404).send({ key: undefined });
})
});

app.post('/api/signup' , jsonParser, (request, response) => {
    var { email, password, name, phone } = request.body;
    var query = `INSERT INTO public."User" 
    (name, phone, email, password, role) VALUES
    ('${name}', '${phone}', '${email}', '${password}', 'user');`;

    pool.query(query, (err, res) =>{
        if(err && err.code === '23505'){
            console.log(err);
            response.status(404).send({text: "email or phone already exist"});
            return;
        }
        else if(err){
            console.log(err);
            response.status(404);
            return;
        }
        else {
            response.status(200).send({text: "success"})
        }
    });

});

app.post('/api/user/addTracker', verifyToken, jsonParser, (request, response) => {
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

app.get('/api/user/getTracker', verifyToken, jsonParser, (request, response) => {
    const id = response.locals.id;
    
    var query = `SELECT ev.id, ev.name, ev.description,
    ev.datebegin, ev.datefinal, ev.type FROM public."User" AS us
    INNER JOIN public."EventUserTracking" AS eut ON
    us.id = eut.id_user INNER JOIN public."Event" AS ev 
    ON eut.id_event = ev.id WHERE us.id = ${id};`;

    pool.query(query, (err, res)=>{
        if(err){
            console.log(err);
            response.status(404);
            return;
        }
        response.status(200).send(res.rows);
    });

});

app.get('/api/user/getArchiveEvent', jsonParser, (request, response) => {
  var query = `SELECT * FROM public."Event"
  WHERE isarchive = true;`;

  pool.query(query, (err, res)=>{
      if(err){
          console.log(err);
          response.status(404);
          return;
      }
      response.status(200).send(res.rows);
  });
});


app.delete('/api/user/deleteTracker', verifyToken, jsonParser, (request, response) => {
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

app.post('/api/user/addRequestEvent', verifyToken, jsonParser, (request, response) => {
  const id = response.locals.id;

  var { name, datebegin, datefinal, description, type } = request.body;
  
  var query = `INSERT INTO public."EventRequest"
  (name, datebegin, datefinal, description, id_user, type) VALUES
  ('${name}', `;

  if(datebegin) query += `'${datebegin}', `; else query += `NULL, `;
  if(datefinal) query += `'${datefinal}', `; else query += `NULL, `;

  query += `'${description}', ${id}, '${type}');`;

  console.log(query)

  pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }
      response.status(200).send({text: "success"});
  });

});

function verifyToken(request, response, next) {
    const header = request.headers["authorization"];
    console.log("got " + header);
    if (typeof header !== undefined && header) {
      jwt.verify(header.split(" ")[1], "MIREAfan", function (err, decoded) {
        console.log(decoded);
        if (err) {
          response.status(401).send({});
        } else if (decoded.exp <= Date.now()) {
            pool.query(
            `Select * from public."User" where email like '${decoded.login}'`,
            (err, results) => {
              console.warn("test");
              console.log(results.rows[0]);
              if (results.rows[0].email === decoded.login) {
                response.locals.id = results.rows[0].id;
                next();
              }
              else response.status(401).send({});
            }
          );
        }
      });
    } else {
      response.status(401).send({});
    }
  }

function verifyAdminToken(request, response, next) {
    const header = request.headers["authorization"];
    console.log("got " + header);
    if (typeof header !== undefined && header) {
      jwt.verify(header.split(" ")[1], "MIREAfan", function (err, decoded) {
        console.log(decoded);
        if (err) {
          response.status(401).send({});
        } else if (decoded.exp <= Date.now()) {
            pool.query(
            `Select * from public."User" where email like '${decoded.login}'`,
            (err, results) => {
              console.warn("test");
              console.log(results.rows[0]);
              if (results.rows[0].email === decoded.login && results.rows[0].role === 'admin') {
                response.locals.id = results.rows[0].id;
                next();
              }
              else response.status(401).send({});
            }
          );
        }
      });
    } else {
      response.status(401).send({});
    }
  }

function main() {
    try{
        pool.connect();
        app.listen(PORT);
        console.log("Соединение c базой данных успешно");
    }catch(err){
        return console.log(err);
    }
}

main();
