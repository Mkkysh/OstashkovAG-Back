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

app.get('/api/getEvents' , jsonParser, (request, response) => {
    var query = `SELECT * From public."Event";`
    client.query(query, (err, res)=>{
        if(err) {
            console.log(err);
            return;
        }
        response.status(200).send(res.rows)
    })
});



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


