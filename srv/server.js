const cds = require("@sap/cds");
const cors = require("cors");
const adapterProxy = require("@sap/cds-odata-v2-adapter-proxy");
//const helmet = require("helmet");

cds.on("bootstrap", (app) => {

    app.use(adapterProxy());
    app.use(cors());
    // app.use(
    //     helmet({
    //         contentSecurityPolicy: {
    //             directives: {
    //                 ...helmet.contentSecurityPolicy.getDefaultDirectives()
    //                 // custom settings
    //             }
    //         }
    //     })
    // )

    app.get("/alive", (_, res) => {
        res.status(200).send("Server is alive");
    })
});

if (process.env.NODE_ENV !== 'production') {

    const cds_swagger = require('cds-swagger-ui-express');

    cds.on('bootstrap', app => app.use(cds_swagger({
        "basePath": "/$api-docs", // the root path to mount the middleware on
        "apiPath": "", // the root path for the services (useful if behind a reverse proxy)
        "diagram": "true" // whether to render the YUML diagram
    })));

    require("dotenv").config()

};

module.exports = cds.server;



