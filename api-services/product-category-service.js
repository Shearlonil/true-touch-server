const db = require('../config/entities-config');
const { Op } = require('sequelize');
const { nanoid } = require('nanoid');

const User = db.users;
const Category = db.categories;

const findByNanoId = async (nano_id) => {
    return await Category.findOne({
        where: { nano_id }
    });
}

const createProductCat = async (creator_id, cat_name) => {
    try {
        return await Category.create({ nano_id: nanoid(), name: cat_name, creator: creator_id });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different name");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
};

const status = async (cat) => {
    try {
        const { status, id } = cat;
        await Category.update({ status }, {
            where: { nano_id: id },
            returning: true,
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
        await Category.update({ name }, {
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
    return await Category.findAll({ 
        where: { status: true },
        attributes: {
            exclude: ['id', 'nano_id'],
            include: [['nano_id', 'id'], 'name', 'creator', 'createdAt', 'status'],
        },
    });
}

/*  method to initialize Product category page with 100 active category to use as defaultOptions for AsyncSelect
    and also count total active category for pagination component */
const activeProductCatPageInit = async (pageSize) => {
    let size = pageSize * 1;    // convert to number
    const [results, metadata] = await db.sequelize.query(
        `SELECT pc.nano_id as id, pc.name, pc.status, pc.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_categories pc inner join staff s on 
        pc.creator = s.id WHERE pc.status = ${'true'} LIMIT :size`, {
            replacements: { 
                size
            },
        }
    );
    const count = await Category.count({where: {status: true}});
    return {count, results};
}

const search = async (prop) => {
    const { str, status } = prop;
    const s = JSON.parse(status)
    const [results, metadata] = await db.sequelize.query(
        `SELECT pc.nano_id as id, pc.name, pc.status, pc.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_categories pc inner join staff s on 
        pc.creator = s.id WHERE pc.name LIKE :searchPattern and pc.status = :s`, {
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
        `SELECT pc.nano_id as id, pc.name, pc.status, pc.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_categories pc inner join staff s on 
        pc.creator = s.id WHERE pc.status = :s LIMIT :size OFFSET :offset`, {
            replacements: { 
                size, s, offset
            },
        }
    );
    const count = await Category.count({where: {status: s}});
    return {count, results};
}

module.exports = {
    findByNanoId,
    createProductCat,
    status,
    search,
    update,
    findAllActive,
    paginateFetch,
    activeProductCatPageInit,
}