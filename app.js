require("dotenv").config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const expressNunjucks = require('express-nunjucks');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const sessionStore = new session.MemoryStore;

const indexRouter = require('./routes/index');
const addRouter = require('./routes/add');
const removeRouter = require('./routes/remove');
const diplomaUpload = require('./routes/diplomaUpload');
const diplomaRemove = require('./routes/diplomaRemove');
const checkRouter = require('./routes/check');

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', __dirname + '/views');
app.set('view engine', 'nj');

const navItems = [
  {
    name: "Главная",
    url: "/"
  },
  {
    name: "Добавить",
    url: "/add"
  },
  {
    name: "Изъять",
    url: "/remove"
  }
]

const njk = expressNunjucks(app, {
  watch: isDev,
  noCache: isDev,
  globals: {
    test: "text",
    navItems
  }
});

const reqCtxProcessor = (req, ctx) => {
  ctx.flashMessage = req.session.sessionFlash
  ctx.path = req.path
  delete req.session.sessionFlash
}

app.use(logger('dev'));
app.use(session({ 
  secret: 'hohoho, ima the god', 
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(njk.ctxProc([
  reqCtxProcessor
]));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/add', addRouter);
app.use('/diploma-upload', diplomaUpload);
app.use('/remove', removeRouter);
app.use('/diploma-remove', diplomaRemove);
app.use('/check', checkRouter);

// 404
app.use(function (req, res, next) {
  res.status(404);
  res.render('404', { title: 'Sory we can\'t find that.'});
});
// 500
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { title: 'Something went wrong.', error: err })
});

module.exports = app;
