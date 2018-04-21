var AWS = require('aws-sdk');
var uuidv1 = require('uuid/v1');

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
};

AWS.config.update({ region: process.env.SDB_REGION });
sdb = new AWS.SimpleDB();

// Create Promise wrappers
const sdbPutAttributes = params => new Promise(
    (resolve,reject) => {
        sdb.putAttributes(params, function(err, data) {
            console.log(err)
            if (err) reject(err);
            else resolve(data);
        })
    }
)
const sdbSelect = params => new Promise(
    (resolve,reject) => {
        sdb.select(params, function(err, data) {
            console.log("help!")
            if (err) reject(err);
            else resolve(data);
        })
    }
)

// Create handlers
async function handlePut(event) {
    try {
        return {
            statusCode: 200,
            headers: headers,
            body: await sdbPutAttributes(
                {
                    DomainName: process.env.SDB_DOMAIN,
                    ItemName: uuidv1(),
                    Attributes: [
                        {
                            Name: 'createdAt',
                            Value: new Date().toISOString()
                        },
                        {
                            Name: 'collectedAt',
                            Value: String(event.collectedAt)
                        },
                        {
                            Name: 'temperature',
                            Value: String(event.temperature)
                        },
                        {
                            Name: 'accelerometer',
                            Value: String(event.accelerometer)
                        },
                        {
                            Name: 'lux',
                            Value: String(event.lux)
                        },
                        {
                            Name: 'pressure',
                            Value: String(event.pressure)
                        },
                        {
                            Name: 'rgb',
                            Value: String(event.rgb)
                        }
                    ]
                }
            )
        }
    }
    catch(err) {
        console.log(JSON.stringify(err,undefined,2))
        return {
            statusCode: 500,
            headers: headers,
            body: err
        }
    }
}

async function handleGet(event) {
    try {
        return {
            statusCode: 200,
            headers: headers,
            body: await sdbSelect({SelectExpression: `SELECT collectedAt, temperature FROM ${process.env.SDB_DOMAIN} WHERE collectedAt > '${new Date(new Date().setDate(new Date().getDate()-1)).toISOString()}'`})
        }
    }
    catch(err) {
        console.log(JSON.stringify(err,undefined,2))
        return {
            statusCode: 500,
            headers: headers,
            body: err
        }
    }
}

// Exports
exports.put = async(event) => {
    return await handlePut(event);
}

exports.get = async(event) => {
    return await handleGet(event);
}