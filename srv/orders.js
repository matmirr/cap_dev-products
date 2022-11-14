const cds = require("@sap/cds");
const { Orders } = cds.entities("com.training");

module.exports = (srv) => {

    // ****** BEFORE ALL ****** /
    srv.before("*", (req) => {
        console.log(`Method = ${req.method}`);
        console.log(`Target = ${req.target}`);
    });

    // ***** BEFORE CREATE ***** /
    srv.before("CREATE", "Orders", (req) => {

        req.data.CreatedOn = new Date().toISOString().slice(0, 10);

        return req;

    });

    // ******** CREATE ******** /
    srv.on("CREATE", "Orders", async (req) => {

        let createdOrder = await cds
            .transaction(req)
            .run(
                INSERT.into(Orders).entries({
                    ClientEmail: req.data.ClientEmail,
                    FirstName: req.data.FirstName,
                    LastName: req.data.LastName,
                    CreatedOn: req.data.CreatedOn,
                    Reviewed: req.data.Reviewed,
                    Approved: req.data.Approved,
                })
            )
            .then((resolve, reject) => {

                console.log("Resolve", resolve);
                console.log("Reject", reject);

                if (typeof resolve !== "undefined") {

                    return req.data;

                } else {

                    req.error(409, "Record Not Inserted");

                };

            })
            .catch((err) => {

                console.log(err);

                req.error(err.code, err.message);


            });

        return createdOrder;

    });

    // ********* READ ********* /
    srv.on("READ", "Orders", async (req) => {

        if (req.data.ClientEmail !== undefined) {

            return await SELECT.from(Orders)
                .where`ClientEmail = ${req.data.ClientEmail}`;

        }

        return await SELECT.from(Orders);
    })

    // ****** AFTER READ ****** /
    srv.after("READ", "Orders", (data) => {

        return data.map(order => order.Reviewed = true);

    })

    // ******** UPDATE ******** /
    srv.on("UPDATE", "Orders", async (req) => {

        let updatedOrder = await cds
            .transaction(req)
            .run(
                [
                    UPDATE(Orders, { ClientEmail: req.data.ClientEmail }).set({
                        FirstName: req.data.FirstName,
                        LastName: req.data.LastName
                    })
                ]

            )
            .then((resolve, reject) => {

                console.log("Resolve", resolve);
                console.log("Reject", reject);

                if (resolve[0] == 0) {

                    req.error(409, "Record Not Found");

                };

            })
            .catch((err) => {

                console.log(err);

                req.error(err.code, err.message);

            });

        return updatedOrder;

    });

    // ******** DELETE ******** /
    srv.on("DELETE", "Orders", async (req) => {

        let deletedOrder = await cds
            .transaction(req)
            .run(
                DELETE.from(Orders).where({
                    ClientEmail: req.data.ClientEmail
                })
            )
            .then((resolve, reject) => {

                console.log("Resolve", resolve);
                console.log("Reject", reject);

                if (resolve !== 1) {

                    req.error(409, "Record Not Found");

                };

            })
            .catch((err) => {

                console.log(err);

                req.error(err.code, err.message);

            });

        return deletedOrder;

    });

    // ******** FUNCTION ******** /
    srv.on("getClientTaxRate", async (req) => {

        const db = srv.transaction(req);

        let results = await db
            .read(Orders, ["Country_code"])
            .where({ ClientEmail: req.data.clientEmail });

        switch (results[0].Country_code) {

            case 'ES':

                return 21.5;

            case 'UK':

                return 24.6;

            default:

                break;
        }

    });

    // ******** ACTION ******** /
    srv.on("cancelOrder", async (req) => {

        const db = srv.transaction(req);

        let { clientEmail } = req.data;

        let resultsRead = await db
            .read(Orders, ["FirstName", "LastName", "Approved"])
            .where({ ClientEmail: clientEmail });

        let returnOrder = {
            status: "",
            messsage: ""
        }

        if (resultsRead[0].Approved == false) {

            let resultsUpdate = await db
                .update(Orders)
                .set({Status : 'C'})
                .where({ ClientEmail: clientEmail  });

            returnOrder.status = "Succeded"
            returnOrder.messsage = `The Order placed by ${resultsRead[0].FirstName} ${resultsRead[0].LastName} was canceled`;

        } else {

            returnOrder.status = "Failed"
            returnOrder.messsage = `The Order placed by ${resultsRead[0].FirstName} ${resultsRead[0].LastName} was NOT canceled (already approved)`;

        };

        return returnOrder;

    });

};