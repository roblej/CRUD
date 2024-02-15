const express = require('express');
const app = express();

// app.js를 연결합니다.
const appRoutes = require('./app');

// 미들웨어로 appRoutes를 사용합니다.
app.use('/', appRoutes);

// 서버를 실행합니다.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
