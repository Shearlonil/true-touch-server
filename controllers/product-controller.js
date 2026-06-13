const express = require('express');
const router = express.Router();

const { authorities } = require('../utils/default-entries');
const preAuthorize = require('../middleware/verify-authorities');
const { productCreationSchema } = require('../yup-schemas/product-schema');
const { encrypt, decrypt } = require('../utils/crypto-helper');
const { verifyAccessToken } = require('../middleware/jwt');
const productService = require('../api-services/product-service');
const validate = require('../middleware/schemer-validator');

const createProduct = async (req, res) => {
    try {
        const id = decrypt(req.whom.id);
        res.status(200).json(await productService.createProduct(id, req.body));
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

router.route('/create').post( verifyAccessToken, preAuthorize(authorities.createProducts.code), validate(productCreationSchema), createProduct );

module.exports = router;