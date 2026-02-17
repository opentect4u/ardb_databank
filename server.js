const express = require("express"),
    session = require("express-session"),
    app = express(),
    expressLayouts = require("express-ejs-layouts"),
    cors = require("cors"),
    flash = require('connect-flash'),
    path = require('path'),
    port = process.env.PORT || 3000;

require('dotenv').config();
app.use(require('cookie-parser')());

app.use(cors())

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))

app.use(express.static(path.join(__dirname, "assets")));

//ejs
app.set("view engine", "ejs")
//ejs uiew path
app.set("views", path.join(__dirname, 'view'))

// express layout
app.use(expressLayouts);
app.set("layout", "./template/layout");
// end

// SESSION
app.use(
    session({
        secret: "ARDB_DDS",//project name secretKey
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 36000000,//time 1000 h
        },
    })
);
// END

app.use(flash());
app.use((req, res, next) => {
    console.log(req.path, 'pppppppppppppppppppppppppppppppppppppppp');

    res.locals.currentUser = req.user;
    res.locals.user = req.session.user ? req.session.user : null
    res.locals.path = req.path;
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning');
    res.locals.success = req.flash('success');
    next()
})

app.get('/', (req, res) => {
    res.redirect('/admin/login');
})

app.use('/admin', require('./routes/admin/indexRouter').indexAdminRouter);
app.use('/api/v1', require('./routes/api/v1/indexApiRouter').indexApiRouter)

// app.get('*', function (req, res) {
//     res.render('auth/error_404')
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});