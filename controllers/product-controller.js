const express = require('express');
const router = express.Router();

const { authorities } = require('../utils/default-entries');
const preAuthorize = require('../middleware/verify-authorities');
const { productCreationSchema, productFilterSearchSchema } = require('../yup-schemas/product-schema');
const { encrypt, decrypt } = require('../utils/crypto-helper');
const { verifyAccessToken } = require('../middleware/jwt');
const productService = require('../api-services/product-service');
const { validateReqBody, validateReqQuery } = require('../middleware/schemer-validator');
const { routeStringMiscParamSchema, routeBooleanParamSchema, routePositiveNumberMiscParamSchema } = require('../yup-schemas/request-params');

const findByNanoId = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.params.nano_id);
        res.status(200).json( await productService.findByNanoId(req.params.id) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const createProduct = async (req, res) => {
    try {
        const id = decrypt(req.whom.id);
        res.status(200).json(await productService.createProduct(id, req.body));
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const status = async (req, res) => {
    // endpoint will receive an object of form {staff_id, status}.
    try {
        const id = decrypt(req.whom.id);
        routeStringMiscParamSchema.validateSync(req.body.id);
        routeBooleanParamSchema.validateSync(req.body.status);
        res.status(200).json( await productService.status(req.body));
    } catch (error) {
        res.status(400).json({'message': error.message});
    }
}

const update = async (req, res) => {
    try {
        await productService.update(req.body);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const findAllActive = async (req, res) => {
    try {
        res.status(200).json(await productService.findAllActive());
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const activeProductPageInit = async (req, res) => {
    try {
        // const mode = decrypt(req.whom.mode);
        // if(mode !== '0'){
        //     return res.sendStatus(404);
        // }
        routePositiveNumberMiscParamSchema.validateSync(req.params.pageSize);
        res.status(200).json(await productService.activeProductPageInit(req.params.pageSize));
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const search = async (req, res) => {
    try {
        // const mode = decrypt(req.whom.mode);
        // if(mode !== '0'){
        //     return res.sendStatus(404);
        // }
        routeStringMiscParamSchema.validateSync(req.query.str);
        routeBooleanParamSchema.validateSync(req.query.status);
        res.status(200).json( await productService.search(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const paginateFetch = async (req, res) => {
    try {
        routePositiveNumberMiscParamSchema.validateSync(req.query.page);
        routePositiveNumberMiscParamSchema.validateSync(req.query.pageSize);
        routeBooleanParamSchema.validateSync(req.query.status);
        res.status(200).json( await productService.paginateFetch(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const filterPaginateFetch = async (req, res) => {
    try {
        res.status(200).json( await productService.filterPaginateFetch(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const random = async (req, res) => {
    try {
        res.status(200).json( await productService.random() );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

router.route('/create').post( verifyAccessToken, preAuthorize(authorities.createProducts.code), validateReqBody(productCreationSchema), createProduct );
router.route('/update').put( verifyAccessToken, preAuthorize(authorities.updateProducts.code), validateReqBody(productCreationSchema), update );
router.route('/status').put( verifyAccessToken, preAuthorize(authorities.deleteActivateProducts.code), status );
router.route('/active/init/:pageSize').get( activeProductPageInit );
router.route('/active/all').get( findAllActive );
router.route('/search/page/:pageNumber').get( paginateFetch );
router.route('/search/:nano_id').get( findByNanoId );
router.route('/query/filter').get( validateReqQuery(productFilterSearchSchema), filterPaginateFetch );
router.route('/query').get( search );
router.route('/random').get( random );

module.exports = router;