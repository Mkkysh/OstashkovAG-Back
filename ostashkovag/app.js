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

app.post('/api/getEvents', verifyAdminToken, jsonParser, (request, response) => {
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

    client.query(queryCount, (err, res)=>{
        if(err) {
                console.log(err);
                return;
        }
        countPage = Math.ceil(res.rowCount/countEvents);
    })

    client.query(query, (err, res)=>{
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

    client.query(query, (err, res)=>{
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

function verifyToken(request, response, next) {
    const header = request.headers["authorization"];
    console.log("got " + header);
    if (typeof header !== undefined && header) {
      jwt.verify(header.split(" ")[1], "MIREAfan", function (err, decoded) {
        console.log(decoded);
        if (err) {
          response.status(401).send({});
        } else if (decoded.exp <= Date.now()) {
          client.query(
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
          client.query(
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
        client.connect();
        app.listen(PORT);
        console.log("Соединение c базой данных успешно");
    }catch(err){
        return console.log(err);
    }
}

main();


