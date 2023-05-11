const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const pg = require('pg');
const fs = require("fs");



const jsonParser = express.json();
const PORT = 3000;
const app = express();

const eventRouter = require('./routes/eventRoute');

app.use('/api/event', eventRouter);
app.use('/api/event', eventRouter);

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.originalname.split(".")[0] +
        uniqueSuffix +
        "." +
        file.originalname.split(".")[1]
    );
  },
});

const upload = multer({ storage: storage });

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

function parseEventRowsByPhothos(events){
  var result = [];

  for(i in events){
    if([...new Set(result.map(item => item.id))]
    .includes(events[i].id))
        continue;
    result.push({...events[i], photoReport: [], comments: []});
  }

  for(i in result){
    for(j in events){

      if(events[j].id === result[i].id){
        if(events[j].order_rows === 1 && 
          !result[i].photo.includes(events[j].photo))
          result[i].photo = events[j].photo;
        else if(result[i].order_rows !== 2 && 
          !result[i].photo.includes(events[j].photo))
          result[i].photoReport
          .push(events[j].photo);
        }

        if(!result[i].comments.some(el => {
          return el.name === events[j].username
        }))
        result[i].comments
        .push({
          name: events[j].username, 
          comment: events[j].feedback,
          date: events[j].date
        });
      }

    delete result[i].feedback;
    delete result[i].date;
    delete result[i].username;
    delete result[i].order_rows;
  }
  return result;
}


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
    res.rows[0]?.email === email,
    res.rows[0]?.password === password) {
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
            response.status(404).send({isExist: true});
            return;
        }
        else if(err){
            console.log(err);
            response.status(404);
            return;
        }
        else {
            response.status(200).send({text: "success", isExist: false})
        }
    });

});

app.post('/api/user/event/tracker/add', verifyToken, jsonParser, (request, response) => {
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

app.get('/api/user/event/tracker', verifyToken, jsonParser, (request, response) => {
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

app.delete('/api/user/event/tracker/delete', verifyToken, jsonParser, (request, response) => {
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

app.post('/api/user/event/request/add', verifyToken, jsonParser, (request, response) => {
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



app.get('/api/admin/event/request/get', verifyAdminToken, jsonParser,(request, response) => {
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

app.post('/api/user/issue/add', verifyToken, jsonParser, (request, response) => {
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

app.get('/api/admin/issue/get', verifyAdminToken, jsonParser, (request, response) => {
  
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

app.get('/api/new/get', jsonParser, (request, response) => {
    const query = `SELECT * FROM public."News"
    ORDER BY date DESC;`;

    pool.query(query, (err, res) => {
        if(err){
          console.log(err);
          response.status(404);
          return;
        }
        response.status(200).send(res.rows);
    });
});

app.post('/api/admin/new/add', jsonParser, (request, response) => {
  var { title, text, type } = request.body;
  
  var query = `INSERT INTO public."News"
  (title, date, text, type) VALUES
  ('${title}', DATE(NOW()), '${text}', '${type}');`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }
    response.status(200).send({text: "success"});
  })
});

app.post('/api/admin/event/add', upload
        .fields([{name: "pic", maxCount:10}]), jsonParser, async (request, response)=>{
  var data = JSON.parse(request.body.data);

  var { name, description, datebegin, datefinal, address, type } = data;

  var query = `INSERT INTO public."Event" 
  (name, description, address, datebegin, datefinal, type, isarchive) VALUES
  ('${name}', '${description}', '${address}', '${datebegin}', '${datefinal}', '${type}', false)
  RETURNING id;`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }
   
    var id_event = res.rows[0].id;

    var query = `INSERT INTO public."MediaStorage"
    (name) VALUES ('${request.files.pic[0].filename}')
    RETURNING id;`;

    pool.query(query, (err, res)=>{
        if(err){
          console.log(err);
          response.status(404);
          return;
        }
        
        id_media = res.rows[0].id;
        var query = `INSERT INTO public."MediaStorageEvent"
        (id_event, id_media, order_rows)
        VALUES (${id_event}, ${id_media}, 1);`;

        pool.query(query, (err,res)=>{
          if(err){
            console.log(err);
            response.status(404);
            return;
          }

          response.status(200).send({text: "success"});

      });
    });
  });
});

app.put('/api/admin/event/:id/addPhotoRecord', upload
  .fields([{name: "pic", maxCount:20}]) ,
  jsonParser,(request, response) => {
    const id = request.params.id;

    var  files = request.files.pic

    var query = `INSERT INTO public."MediaStorage"
    (name) VALUES `;

    files.forEach((element, index) => {
      query += `('${element.filename}'),`;
      if(index === files.length - 1)
        query = query.slice(0, -1);
    });

    query += ` RETURNING id;`;

    pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }

      var result = res.rows;

      var query = `INSERT INTO public."MediaStorageEvent"
      (id_event, id_media, order_rows)
      VALUES  `;

      result.forEach((element, index) => {
        query += `(${id}, ${element.id}, 3),`;
        if(index === result.length - 1)
          query = query.slice(0, -1);
      })

      pool.query(query, (err, res)=>{
        
        if(err){
          console.log(err);
          response.status(404);
          return;
        }

        response.status(200).send({text: "success"});
      });
    });
});

app.delete('/api/admin/event/:id/delete',
jsonParser, async (request, response) => {
  const id_event = request.params.id;

  var { photo } = request.body;

  var query = `SELECT id FROM public."MediaStorage" 
  WHERE name = '${photo}';`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }
    var id_media = res.rows[0].id;

    const query  = `DELETE FROM public."MediaStorageEvent"
    WHERE id_event = ${id_event} AND id_media = ${id_media};`;

    pool.query(query, (err, res)=>{
      if(err){
        console.log(err);
        response.status(404);
        return;
      }

      var query = `DELETE FROM public."MediaStorage"
      WHERE id = ${id_media};`;

      pool.query(query, (err, res)=>{
        if(err){
          console.log(err);
          response.status(404);
          return;
        }
        
        fs.unlink('uploads/' + photo, (err) => {
          if(err){
            console.log(err);
            response.status(404);
            return;
          }

          response.status(200).send({text: "success"});

        });
      });
    });
  });
});

app.put('/api/event/:id/update', 
  upload.fields([{name: "pic", maxCount:1}]),
  async (request, response) => {
  const id = request.params.id;

  var photo = request.files?.pic

  if (request.body?.data)
    var data = JSON.parse(request.body?.data)
  else data = {undefined: undefined}

  var { name, description, address, datebegin, datefinal, 
  type, isarchive } = data;

  try {

  if(name || description || address 
    || datebegin || datefinal || type || isarchive!==undefined){  

  var query = `UPDATE public."Event"
  SET ${name ? `name = '${name}', ` : ``}
  ${description ? `description = '${description}', ` : ``}
  ${address ? `address = '${address}', ` : ``}
  ${datebegin ? `datebegin = '${datebegin}', ` : ``}
  ${datefinal ? `datefinal = '${datefinal}', ` : ``}
  ${type ? `type = '${type}', ` : ``}
  ${isarchive!==undefined ? `isarchive = ${isarchive}, ` : ``}`;

  query = query.slice(0, query.lastIndexOf(`,`)) + `` 
  + query.slice(query.lastIndexOf(`,`) + 1);

  query += `WHERE id = ${id};`;

  pool.query(query, (err,res) => {
    if(err){
      console.log(err);
      console.log("error text");
      response.status(404);
      return;
    }
  });
  }
} catch (error) {
  console.log(error);
}
finally {
  try {
  console.log("step1");
  if(photo){
    var query = `UPDATE public."MediaStorage" AS ms
    SET name = '${photo[0].filename}'
    FROM public."MediaStorageEvent" as mse
    WHERE ms.id = mse.id_media AND 
    mse.id_event = ${id} AND mse.order_rows = 1
    RETURNING (
       SELECT name FROM public."MediaStorage" AS ms
       INNER JOIN public."MediaStorageEvent" AS mse
       ON ms.id = mse.id_media
       WHERE mse.id_event = ${id} AND mse.order_rows = 1
    ) AS old_name;`;

    pool.query(query, (err,res) =>{
      if(err){
        console.log(err);
        console.log("photo");
        response.status(404);
        return;
      }

      fs.unlink('uploads/' + res.rows[0].old_name, (err) => {
        if(err){
          console.log(err);
          response.status(404);
          return;
          }
        });
    });
  }
} catch (error) {console.log(error);} finally{
  console.log("step2");
  response.status(200).send({text: "success"});
}
} 
});

app.put('/api/admin/new/:id/update', 
jsonParser ,(request, response) => {
    const id = request.params.id;

    var { title, date, text, type } = request.body;

    var query = `UPDATE public."News"
    SET ${title ? `title = '${title}', ` : ``}
    ${date ? `date = '${date}', ` : ``}
    ${text ? `text = '${text}', ` : ``}
    ${type ? `type = '${type}', ` : ``} `;

    query = query.slice(0, query.lastIndexOf(`,`)) + ``
    + query.slice(query.lastIndexOf(`,`) + 1);

    query += `WHERE id = ${id};`;

    pool.query(query, (err,res) => {
      if(err){
        console.log(err);
        response.status(404);
        return;
      }
      response.status(200).send({text: "success"});
    })
});

app.get('/api/event/:id', jsonParser, (request, response) => {
  const id = request.params.id;

  var query = `SELECT ev.id, ev.name, ev.description,
  ev.datebegin, ev.datefinal, ev.type, ms.name AS photo,
  mse.order_rows, u.name AS username, eua.feedback, eua.date 
  AS comm_date FROM public."Event" AS ev
  INNER JOIN public."MediaStorageEvent" AS mse
  ON mse.id_event = ev.id
  INNER JOIN public."MediaStorage" AS ms
  ON ms.id = mse.id_media
  LEFT JOIN public."EventUserArchive" AS eua
  ON ev.id = eua.id_event
  LEFT JOIN public."User" AS u
  ON u.id = eua.id_user
  WHERE ev.id = ${id}
  ORDER BY comm_date DESC;`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }

    console.log(res.rows);

    var result = parseEventRowsByPhothos(res.rows);

    response.status(200).send(result);
  });

});



app.post('/api/event/find', jsonParser, (request, response) => {

  var {text} = request.body;

  var query = `SELECT id, name FROM public."Event"
  WHERE REPLACE(lower(name), ' ', '') LIKE '%${text.toLowerCase().replaceAll(' ', '')}%';`;

  pool.query(query, (err, res)=>{
    if(err){
      console.log(err);
      response.status(404);
      return;
    }
    response.status(200).send(res.rows);
  })
});

app.post('/api/user/event/:id/review', verifyToken,jsonParser, (request, response) => {

  var {text} = request.body;
  const id = request.params.id;
  const id_user = response.locals.id;

  var query = `INSERT INTO public."EventUserArchive"
  (id_event, id_user, feedback, date) VALUES (${id}, 
  ${id_user}, '${text}', NOW());`;

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
        if (err) {
          response.status(401).send({});
        } else if (decoded.exp <= Date.now()) {
            pool.query(
            `Select * from public."User" where email like '${decoded.login}'`,
            (err, results) => {
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

app.get("/api/public/*", (req, res, next) => {
  res.sendFile("uploads/" + req.path.substring(12).replace('%20', ' '), { root: __dirname });
});

main();
