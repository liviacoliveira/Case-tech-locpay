var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Importar novas rotas
var indexRouter = require('./routes/index');
var operationsRouter = require('./routes/operations');
var receiversRouter = require('./routes/receivers');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public')); // Adicione esta linha

// Configurar rotas
app.use('/', indexRouter);
app.use('/operations', operationsRouter);
app.use('/receivers', receiversRouter);

// Adicionar inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;