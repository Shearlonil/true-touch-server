const express = require('express');
const router = express.Router();

const transactionService = require('../api-services/transaction-service');
const { verifyAccessToken, createClientAccessToken } = require('../middleware/jwt');
const { decrypt, encrypt } = require('../utils/crypto-helper');
const { routePositiveNumberMiscParamSchema, routeStringMiscParamSchema, routeBooleanParamSchema } = require('../yup-schemas/request-params');

/*  ref:    
    https://www.youtube.com/watch?v=YEhIz2802C4
    https://www.youtube.com/watch?v=wn7Lxx5ugoo
    https://github.com/ZestArinze/payment-integration-paystack-tutorial
*/

const initializeSalesTransaction = async (req, res) => {
    try {
        const id = decrypt(req.whom.id);
        routeStringMiscParamSchema.validateSync(req.params.nano_id);
        return res.status(200).json(await transactionService.initializeSalesTransaction(id, req.params.nano_id));
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const webhook = async (req, res) => {
    /*  PROCEDURE
        *   After successful paystack payment, raise invoice with following data
                =>  id
                => paystack transaction ref
                => status (delivered, processing)
        *   Create SalesRecord for items bought
    */
    try {
        await transactionService.webhook(req.body, req.headers['x-paystack-signature']);
        // Return a 200 response to acknowledge receipt of the event
        return res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const callback = async (req, res) => {
    try {
        //  TODO: change to process.env.BASE_URL for production
        /*  Redirecting ref:
            https://stackoverflow.com/questions/19035373/how-do-i-redirect-in-expressjs-while-passing-some-context
        */
        return res.status(301).redirect(`http://localhost:5173/dashboard/client/profile/transactions/verify/${req.query.reference}`);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const verifySubTransaction = async (req, res) => {
    try {
        const id = decrypt(req.whom.id);
        // return res.status(200).json(await transactionService.verifySubTransaction(id, req.query.reqQuery));
        const updatedClient = await transactionService.verifySubTransaction(id, req.query.reqQuery);
        // set mode to use in refresh token (specifies staff or client, 0 for Staff, 1 for Client)
        updatedClient.mode = encrypt('1');
        // create jwt access token
        const accessToken = createClientAccessToken(updatedClient);
        //  Because of cors, only some of the headers will be accessed by the browser. [Cache-Control, Content-Language, Content-Type, Expires, Last-Modified, Pragma]
        res.setHeader("Access-Control-Expose-Headers", "X-Suggested-Filename, authorization");
        res.setHeader('authorization', 'Bearer ' + accessToken);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

router.route('/sales/initialize/:nano_id').post( verifyAccessToken, initializeSalesTransaction );
router.route('/paystack/webhook').post( webhook );
router.route('/paystack/callback').get( callback );
router.route('/paystack/verification').get( verifyAccessToken, verifySubTransaction );

module.exports = router;