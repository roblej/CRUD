const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mysql = require('mysql2');
require('dotenv').config();

const app = express()
// const port = 3000
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', './views')

// app uses static files from 'public' folder
app.use(express.static(__dirname+'/public'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// MySQL connection
const connectionPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    insecureAuth: true,
  });

connectionPool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL에 연결 중 에러 발생:', err);
  } else {
    console.log('MySQL에 연결되었습니다.');
      // 사용이 끝난 경우 연결을 풀에 반환합니다.
    connection.release();
  }
})

//Root URL('/') 경로에 대한 Get 요청
app.get('/', function (req, res) {
  res.render('index');
})

//특정 URL 경로에 대한 Get 요청 - 1
app.get('/boards', function (req, res) {
  res.render('boards')
})

//특정 URL 경로에 대한 Get 요청 - 2
app.get('/users', function (req, res) {
  res.render('users')
})

app.get('/contact', function (req, res) {
    res.render('contact')
  })

app.get('/contactList', (req, res) => {
  // 커넥션 풀에서 커넥션을 얻어옵니다.
  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 커넥션 얻는 중 에러 발생:', err);
      res.status(500).send('내부 서버 오류');
    } else {
      const selectQuery = `
        select * from contact order by id desc
      `;

      // 얻어온 커넥션을 사용하여 쿼리를 실행합니다.
      connection.query(selectQuery, function (queryErr, result) {
        // 쿼리 실행이 끝나면 반드시 커넥션을 풀에 반환합니다.
        connection.release();

        if (queryErr) {
          console.error('데이터 조회 중 에러 발생:', queryErr);
          res.status(500).send('내부 서버 오류');
        } else {
          console.log('데이터가 조회되었습니다.');
					console.log(result);
          res.render('contactList', {lists:result});
        }
      });
    }
  })
})

app.delete('/api/contactDelete/:id', function (req, res) {
  const id = req.params.id;
  // 커넥션 풀에서 커넥션을 얻어옵니다.
  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 커넥션 얻는 중 에러 발생:', err);
      res.status(500).send('내부 서버 오류');
    } else {
      const deleteQuery = `
        DELETE FROM contact WHERE id='${id}'
      `;

      // 얻어온 커넥션을 사용하여 쿼리를 실행합니다.
      connection.query(deleteQuery, function (queryErr, result) {
        // 쿼리 실행이 끝나면 반드시 커넥션을 풀에 반환합니다.
        connection.release();

        if (queryErr) {
          console.error('데이터 삭제 중 에러 발생:', queryErr);
          res.status(500).send('내부 서버 오류');
        } else {
          console.log('데이터가 삭제되었습니다.');
          res.send("<script>alert('문의사항이 삭제되었습니다.'); location.href='/contactList'</script>");
        }
      });
    }
  });
});

app.put('/api/contactUpdate/:id', function (req, res) {
  const id = req.params.id;
  const status = "done";

  // 커넥션 풀에서 커넥션을 얻어옵니다.
  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 커넥션 얻는 중 에러 발생:', err);
      res.status(500).send('내부 서버 오류');
    } else {
      const updateQuery = `
        UPDATE contact SET status = '${status}' WHERE id = '${id}';
      `;

      // 얻어온 커넥션을 사용하여 쿼리를 실행합니다.
      connection.query(updateQuery, function (queryErr, result) {
        // 쿼리 실행이 끝나면 반드시 커넥션을 풀에 반환합니다.
        connection.release();

        if (queryErr) {
          console.error('데이터 업데이트 중 에러 발생:', queryErr);
          res.status(500).send('내부 서버 오류');
        } else {
          console.log('데이터가 업데이트되었습니다.');
          res.send("<script>alert('문의사항이 업데이트되었습니다.'); location.href='/contactList'</script>");
        }
      });
    }
  });
});

app.post('/api/contact', function (req, res) {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const memo = req.body.memo;
  
  const data = `${name} ${phone} ${email} ${memo}`
    // 커넥션 풀에서 커넥션을 얻어옵니다.
  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 커넥션 얻는 중 에러 발생:', err);
      res.status(500).send('내부 서버 오류');
    } else {
      const insertQuery = `
        INSERT INTO contact(name, phone, email, memo, create_at, modify_at)
        VALUES ('${name}', '${phone}', '${email}', '${memo}', NOW(), NOW())
      `;

      // 얻어온 커넥션을 사용하여 쿼리를 실행합니다.
      connection.query(insertQuery, function (queryErr, result) {
        // 쿼리 실행이 끝나면 반드시 커넥션을 풀에 반환합니다.
        connection.release();

        if (queryErr) {
          console.error('데이터 삽입 중 에러 발생:', queryErr);
          res.status(500).send('내부 서버 오류');
        } else {
          console.log('데이터가 삽입되었습니다.');
          res.send("<script>alert('문의사항이 등록되었습니다.'); location.href='/'</script>");
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
