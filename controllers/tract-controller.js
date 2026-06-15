const express = require('express');
const router = express.Router();

const { authorities } = require('../utils/default-entries');
const preAuthorize = require('../middleware/verify-authorities');
const { encrypt, decrypt } = require('../utils/crypto-helper');
const { verifyAccessToken } = require('../middleware/jwt');
const tractService = require('../api-services/tract-service');
const { validateReqBody } = require('../middleware/schemer-validator');
const { routeStringMiscParamSchema, routeBooleanParamSchema, routePositiveNumberMiscParamSchema } = require('../yup-schemas/request-params');

const findByNanoId = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.params.nano_id);
        res.status(200).json( await tractService.findByNanoId(req.params.id) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const createTract = async (req, res) => {
    try {
        const mode = decrypt(req.whom.mode);
        if(mode !== '0'){
            return res.sendStatus(404);
        }
        const id = decrypt(req.whom.id);
        routeStringMiscParamSchema.validateSync(req.body.tract_name);
        res.status(200).json( await tractService.create(id, req.body.tract_name) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const activate = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.params.nano_id);
        await tractService.activate(req.params.nano_id);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const deactivate = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.body.id);
        routeStringMiscParamSchema.validateSync(req.body.destination_id);
        await tractService.deactivate(req.body);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const update = async (req, res) => {
    try {
        routeStringMiscParamSchema.validateSync(req.query.id);
        routeStringMiscParamSchema.validateSync(req.query.name);
        await tractService.update(req.query);
        res.sendStatus(200);
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const findAllActive = async (req, res) => {
    try {
        res.status(200).json(await tractService.findAllActive());
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
};

const activeProductTractPageInit = async (req, res) => {
    try {
        const mode = decrypt(req.whom.mode);
        if(mode !== '0'){
            return res.sendStatus(404);
        }
        routePositiveNumberMiscParamSchema.validateSync(req.params.pageSize);
        res.status(200).json(await tractService.activeProductTractPageInit(req.params.pageSize));
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
        res.status(200).json( await tractService.search(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

const paginateFetch = async (req, res) => {
    try {
        routePositiveNumberMiscParamSchema.validateSync(req.query.page);
        routePositiveNumberMiscParamSchema.validateSync(req.query.pageSize);
        routeBooleanParamSchema.validateSync(req.query.status);
        res.status(200).json( await tractService.paginateFetch(req.query) );
    } catch (error) {
        return res.status(400).json({'message': error.message});
    }
}

router.route('/create').post( verifyAccessToken, preAuthorize(authorities.createTract.code), createTract );
router.route('/update').put( verifyAccessToken, preAuthorize(authorities.updateBrands.code), update );
router.route('/status/activate/:nano_id').put( verifyAccessToken, preAuthorize(authorities.deleteActivateTract.code), activate );
router.route('/status/deactivate').put( verifyAccessToken, preAuthorize(authorities.deleteActivateTract.code), deactivate );
router.route('/active/init/:pageSize').get( verifyAccessToken, activeProductTractPageInit );
router.route('/active/all').get( findAllActive );
router.route('/search/:nano_id').get( verifyAccessToken, findByNanoId );
router.route('/search/page/:pageNumber').get( verifyAccessToken, paginateFetch );
router.route('/query').get( verifyAccessToken, search );

module.exports = router;