const db = require('../config/entities-config');
const { Op } = require('sequelize');
const { nanoid } = require('nanoid');

const User = db.users;
const Tract = db.tracts;
const Product = db.products;

const findByNanoId = async (nano_id) => {
    return await Tract.findOne({
        where: { nano_id }
    });
}

const create = async (creator_id, tract_name) => {
    try {
        return await Tract.create({ nano_id: nanoid(), name: tract_name, creator: creator_id });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different name");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
};

const activate = async (nano_id) => {
    try {
        await Tract.update({ status: true }, {
            where: { nano_id },
            returning: true,
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const deactivate = async (data) => {
    try {
        const { id, destination_id } = data;
        const toDel = await Tract.findOne({
            where: { nano_id: id }
        });
        if(!toDel){
            throw new Error("Invalid Department specified")
        }
        const destination = await Tract.findOne({
            where: { nano_id: destination_id }
        });
        if(!destination){
            throw new Error("Invalid destination Department specified")
        }
        await db.sequelize.transaction( async (t) => {
            await Tract.update({ status: false }, {
                where: { nano_id: id },
                returning: true,
            }, { transaction: t });
            await Product.update({ tract_id: destination.id }, {
                where: { tract_id: toDel.id }
            }, { transaction: t });
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const update = async (cat) => {
    try {
        const { name, id } = cat;
        await Tract.update({ name }, {
            where: { nano_id: id },
            returning: true,
        });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different name");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const findAllActive = async () => {
    return await Tract.findAll({ 
        where: { status: true },
        attributes: {
            exclude: ['id', 'nano_id'],
            include: [['nano_id', 'id'], 'name', 'creator', 'createdAt', 'status'],
        },
    });
}

const search = async (prop) => {
    const { str, status } = prop;
    const s = JSON.parse(status)
    const [results, metadata] = await db.sequelize.query(
        `SELECT t.nano_id as id, t.name, t.status, t.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM tracts t inner join staff s on 
        t.creator = s.id WHERE t.name LIKE :searchPattern and t.status = :s`, {
            replacements: { 
                searchPattern: `%${str}%`,
                s,
            },
        }
    );
    return results;
}

const paginateFetch = async (prop) => {
    // page: Current page number (e.g., 1-indexed), pageSize: Number of items per page
    const {page, pageSize, status} = prop; 

    let size = pageSize * 1;    // convert to number
    const offset = (page - 1) * size;
    const s = JSON.parse(status)

    const [results, metadata] = await db.sequelize.query(
        `SELECT t.nano_id as id, t.name, t.status, t.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM tracts t inner join staff s on 
        t.creator = s.id WHERE t.status = :s LIMIT :size OFFSET :offset`, {
            replacements: { 
                size, s, offset
            },
        }
    );
    const count = await Tract.count({where: {status: s}});
    return {count, results};
}

/*  method to initialize Product category page with 100 active category to use as defaultOptions for AsyncSelect
    and also count total active category for pagination component */
const activeProductTractPageInit = async (pageSize) => {
    let size = pageSize * 1;    // convert to number
    const [results, metadata] = await db.sequelize.query(
        `SELECT t.nano_id as id, t.name, t.status, t.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM tracts t inner join staff s on 
        t.creator = s.id WHERE t.status = ${'true'} LIMIT :size`, {
            replacements: { 
                size
            },
        }
    );
    const count = await Tract.count({where: {status: true}});
    return {count, results};
}

module.exports = {
    findByNanoId,
    create,
    activate,
    deactivate,
    search,
    update,
    findAllActive,
    paginateFetch,
    activeProductTractPageInit,
}