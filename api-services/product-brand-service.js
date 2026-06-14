const db = require('../config/entities-config');
const { Op } = require('sequelize');
const { nanoid } = require('nanoid');

const User = db.users;
const Brand = db.brands;

const findByNanoId = async (nano_id) => {
    return await Brand.findOne({
        where: { nano_id }
    });
}

const createBrand = async (creator_id, brand_name) => {
    try {
        return await Brand.create({ nano_id: nanoid(), name: brand_name, creator: creator_id });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different name");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
};

const status = async (brand) => {
    try {
        const { status, id } = brand;
        await Brand.update({ status }, {
            where: { nano_id: id },
            returning: true,
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const update = async (brand) => {
    try {
        const { name, id } = brand;
        await Brand.update({ name }, {
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
    return await Brand.findAll({ 
        where: { status: true },
        attributes: {
            exclude: ['id', 'nano_id'],
            include: [['nano_id', 'id'], 'name', 'creator', 'createdAt', 'status'],
        },
    });
}

/*  method to initialize product_brands page with 100 active product_brands to use as defaultOptions for AsyncSelect
    and also count total active product_brands for pagination component */
const activeProductBrandsPageInit = async (pageSize) => {
    let size = pageSize * 1;    // convert to number
    const [results, metadata] = await db.sequelize.query(
        `SELECT b.nano_id as id, b.name, b.status, b.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_brands b inner join staff s on 
        b.creator = s.id WHERE b.status = ${'true'} LIMIT :size`, {
            replacements: { 
                size
            },
        }
    );
    const count = await Brand.count({where: {status: true}});
    return {count, results};
}

const search = async (prop) => {
    const { str, status } = prop;
    const s = JSON.parse(status);
    const [results, metadata] = await db.sequelize.query(
        `SELECT b.nano_id as id, b.name, b.status, b.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_brands b inner join staff s on 
        b.creator = s.id WHERE b.name LIKE :searchPattern and b.status = :s`, {
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
    const s = JSON.parse(status);

    const [results, metadata] = await db.sequelize.query(
        `SELECT b.nano_id as id, b.name, b.status, b.createdAt, s.fname, s.lname, s.sex, s.email, s.phone FROM product_brands b inner join staff s on 
        b.creator = s.id WHERE b.status = :s LIMIT :size OFFSET :offset`, {
            replacements: { 
                size, s, offset
            },
        }
    );
    const count = await Brand.count({where: {status: s}});
    return {count, results};
}

module.exports = {
    findByNanoId,
    createBrand,
    status,
    search,
    update,
    findAllActive,
    paginateFetch,
    activeProductBrandsPageInit,
}