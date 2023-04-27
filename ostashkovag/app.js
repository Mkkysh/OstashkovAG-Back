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

app.post('/api/getEvents' , jsonParser, (request, response) => {
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
            return;
        }
        response.status(200).send({events: res.rows, countPage: countPage});
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


