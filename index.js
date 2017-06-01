/**
 * Author: Sahid Hernandez
 * Follow bitso documentation:
 * 
 * https://bitso.com/api_info
 * 
 * GET (query) and POST, and even actions on paths are normalized into a single params literal object
 */
const request           = require('superagent');
const rest_spec         = require('./rest_spec');
const crypto            = require('crypto');
module.exports = class BitsoClient {
    constructor({
        host    = 'https://api.bitso.com/',
        version = 'v3',
        key,
        secret
    }) {
        rest_spec.paths.map(endpoint=>{
            Object.defineProperty(this, endpoint.path , {
                enumerable: true,
                configurable: true,
                value: ({params, success, error, method})=>{
                    method = method||endpoint.method;
                    method = method.toUpperCase();
                    const name = Object.keys(params||{}).reduce((result, key)=>result.replace(`:${key}:`, params[key]), endpoint.path);
                    const request_path = `${host}${version}/${name}`;
                    const nonce = new Date().getTime();
                    let Data = `${nonce}${method}/${version}/${endpoint.path}/`;
                    (()=>{
                        switch(method){
                            case 'POST':
                            Data += `${JSON.stringify(params)}`;
                            return request.post(request_path).send(params);
                            case 'DELETE':
                            Data += `${JSON.stringify(params)}`;
                            return request.delete(request_path).send(params);
                            case 'GET':
                            return request.get(request_path).query(params);
                        }
                    })().set({Authorization: `Bitso ${key}:${nonce}:${crypto.createHmac('sha256', secret).update(Data).digest('hex')}`}).then(data=>success(data.body), error);
                }
            })
        })
    }    
}

