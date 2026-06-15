const express = require('express');
const router = express.Router();

const { authorities } = require('../utils/default-entries');
const preAuthorize = require('../middleware/verify-authorities');
const { encrypt, decrypt } = require('../utils/crypto-helper');
const { verifyAccessToken } = require('../middleware/jwt');
const productBrandService = require('../api-services/product-brand-service');
const { validateReqBody } = require('../middleware/schemer-validator');
const { routeStringMiscParamSchema, routeBooleanParamSchema, routePositiveNumberMiscParamSchema } = require('../yup-schemas/request-params');

const findByNanoId = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.params.nano_id);
        res.status(200).json( await productBrandService.findByNanoId(req.params.nano_id) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const createProductBrand = async (req, res) => {
    try {
        const mode = decrypt(req.whom.mode);
        if(mode !== '0'){
            return res.sendStatus(404);
        }
        const id = decrypt(req.whom.id);
        routeStringMiscParamSchema.validateSync(req.query.brand_name);
        res.status(200).json( await productBrandService.createBrand(id, req.query.brand_name) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const status = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.body.id);
        routeBooleanParamSchema.validateSync(req.body.status);
        await productBrandService.status(req.body);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const update = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.query.id);
        routeStringMiscParamSchema.validateSync(req.query.name);
        await productBrandService.update(req.query);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const findAllActive = async (req, res) => {
    try {
        res.status(200).json(await productBrandService.findAllActive());
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const activeProductBrandsPageInit = async (req, res) => {
    try {
        const mode = decrypt(req.whom.mode);
        if(mode !== '0'){
            return res.sendStatus(404);
        }
        routePositiveNumberMiscParamSchema.validateSync(req.params.pageSize);
        res.status(200).json(await productBrandService.activeProductBrandsPageInit(req.params.pageSize));
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const search = async (req, res) => {
    try {
        const mode = decrypt(req.whom.mode);
        if(mode !== '0'){
            return res.sendStatus(404);
        }
        routeStringMiscParamSchema.validateSync(req.query.str);
        routeBooleanParamSchema.validateSync(req.query.status);
        res.status(200).json( await productBrandService.search(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const paginateFetch = async (req, res) => {
    try {
        routePositiveNumberMiscParamSchema.validateSync(req.query.page);
        routePositiveNumberMiscParamSchema.validateSync(req.query.pageSize);
        routeBooleanParamSchema.validateSync(req.query.status);
        res.status(200).json( await productBrandService.paginateFetch(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

router.route('/create').post( verifyAccessToken, preAuthorize(authorities.createBrands.code), createProductBrand );
router.route('/update').put( verifyAccessToken, preAuthorize(authorities.updateBrands.code), update );
router.route('/status').put( verifyAccessToken, preAuthorize(authorities.deleteActivateBrands.code), status );
router.route('/active/init/:pageSize').get( verifyAccessToken, activeProductBrandsPageInit );
router.route('/active/all').get( findAllActive );
router.route('/search/:nano_id').get( verifyAccessToken, findByNanoId );
router.route('/search/page/:pageNumber').get( verifyAccessToken, paginateFetch );
router.route('/query').get( verifyAccessToken, search );

module.exports = router;