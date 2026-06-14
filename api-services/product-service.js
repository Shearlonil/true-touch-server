const db = require('../config/entities-config');
const { Op } = require('sequelize');
const { QueryTypes } = db.sequelize;
const { nanoid } = require('nanoid');
const { format } = require('date-fns');

const User = db.users;
const Product = db.products;
const Brand = db.brands;
const Category = db.categories;
const Tract = db.tracts;
const Barcode = db.barCode;
const ProductExpDate = db.expDate;

const findByNanoId = async (nano_id) => {
    return await Product.findOne({
        where: { nano_id },
        attributes: {
            exclude: ['id', 'nano_id', 'tract_id'],
            include: [['nano_id', 'product_id'], 'name', 'sales_price'],
        },
        include: [
            {
                model: Tract,
                attributes: {
                    exclude: ['id', 'nano_id'],
                    include: [["nano_id", 'id'], 'name'],
                },
            },
            {
                model: Barcode,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: ProductExpDate,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: Brand,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            },
            {
                model: Category,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            }
        ],
    });
}

const createProduct = async (creator_id, data) => {
    try {
        const { product_name, restock_level, expDate, sales_price, brand, category, tract, barcode } = data;
        const savedProduct = await db.sequelize.transaction( async (t) => {
            const dept = await Tract.findOne({
                where: { 
                    nano_id: tract,
                    status: true,
                }
            });
            if(!dept){
                throw new Error("Invalid Product Department specified");
            }

            const product = await Product.create({ 
                nano_id: nanoid(), 
                name: product_name, 
                restock_level, 
                sales_price, 
                creator: creator_id,
                tract_id: dept.id,
            }, { transaction: t });
            
            if(category){
                const c = await Category.findOne({
                    where: { 
                        nano_id: category,
                        status: true,
                    }
                });
                if(!c){
                    throw new Error("Invalid Product Category specified");
                }
                await product.addProductCategory(c, { transaction: t });
            }
            
            if(brand){
                const b = await Brand.findOne({
                    where: { 
                        nano_id: brand,
                        status: true,
                    }
                });
                if(!b){
                    throw new Error("Invalid Product Brand specified");
                }
                await product.addProductBrand(b, { transaction: t });
            }
            
            if(expDate){
                const date = format(expDate, "yyyy-MM-dd");
                await ProductExpDate.create({ product_id: product.id, date }, { transaction: t });
            }
            
            if(barcode && barcode.length > 0){
                await Barcode.create({ product_id: product.id, code: barcode }, { transaction: t });
            }
            return product;
        });
        return Product.findByPk(savedProduct.id, {
            attributes: {
                exclude: ['id', 'nano_id', 'tract_id'],
                include: [['nano_id', 'product_id'], 'name', 'sales_price'],
            },
            include: [
                {
                    model: Tract,
                    attributes: {
                        exclude: ['id', 'nano_id'],
                        include: [["nano_id", 'id'], 'name'],
                    },
                },
                {
                    model: Barcode,
                    attributes: {
                        exclude: ['id', 'product_id'],
                    },
                    required: false, // Force a LEFT OUTER JOIN (makes it optional)
                },
                {
                    model: ProductExpDate,
                    attributes: {
                        exclude: ['id', 'product_id'],
                    },
                    required: false, // Force a LEFT OUTER JOIN (makes it optional)
                },
                {
                    model: Brand,
                    attributes: {
                        exclude: ['id', 'nano_id', 'name'],
                        include: [["nano_id", 'id'], 'name'],
                    },
                    required: false, // Force a LEFT OUTER JOIN (makes it optional)
                    through: { attributes: [] }, // Optional: hides junction table metadata from payload
                },
                {
                    model: Category,
                    attributes: {
                        exclude: ['id', 'nano_id', 'name'],
                        include: [["nano_id", 'id'], 'name'],
                    },
                    required: false, // Force a LEFT OUTER JOIN (makes it optional)
                    through: { attributes: [] }, // Optional: hides junction table metadata from payload
                }
            ],
        });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different value");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
};

const status = async (product) => {
    try {
        const { status, id } = product;
        await Product.update({ status }, {
            where: { nano_id: id },
            returning: true,
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const update = async (data) => {
    try {
        const { product_name, restock_level, expDate, sales_price, brand, category, tract, id, barcode } = data;
        await db.sequelize.transaction( async (t) => {
            const result = await Product.findOne({
                where: { nano_id: id },
                include: [
                    {
                        model: Tract,
                    },
                    {
                        model: Barcode,
                        required: false, // Force a LEFT OUTER JOIN (makes it optional)
                    },
                    {
                        model: ProductExpDate,
                        required: false, // Force a LEFT OUTER JOIN (makes it optional)
                    },
                    {
                        model: Brand,
                        required: false, // Force a LEFT OUTER JOIN (makes it optional)
                        through: { attributes: [] }, // Optional: hides junction table metadata from payload
                    },
                    {
                        model: Category,
                        required: false, // Force a LEFT OUTER JOIN (makes it optional)
                        through: { attributes: [] }, // Optional: hides junction table metadata from payload
                    }
                ],
            });
            if(!result){
                throw new Error("Invalid Product specified");
            }
            
            const dept = await Tract.findOne({
                where: { 
                    nano_id: tract,
                    status: true,
                }
            });
            if(!dept){
                throw new Error("Invalid Product Department specified");
            }

            result.name = product_name;
            result.restock_level = restock_level;
            result.sales_price = sales_price;
            result.tract_id = dept.id;
            
            result.save({ transaction: t });
            const product = result.toJSON();
            
            if(category){
                const c = await Category.findOne({
                    where: { 
                        nano_id: category,
                        status: true,
                    }
                });
                if(!c){
                    throw new Error("Invalid Product Category specified");
                }
                // if category found with saved product and category sent with payload, then upate
                if(product.ProductCategories.length > 0){
                    await  db.sequelize.query(
                        `UPDATE jt_category_products SET category_id = :category_id WHERE product_id = :product_id`,
                        {
                            replacements: { category_id: c.id, product_id: product.id },
                            type: QueryTypes.UPDATE, // Specify the query type
                            transaction: t,
                        }
                    );
                }else {
                    // no previous category attached to product, then attach one now
                    await result.addProductCategory(c, { transaction: t });
                }
            }else {
                // delete previous attached category if available
                await db.sequelize.query(
                    `DELETE jcp FROM jt_category_products as jcp WHERE jcp.product_id = :product_id`,
                    {
                        replacements: { product_id: product.id },
                        type: QueryTypes.DELETE,
                        transaction: t,
                    }
                );
            }
            
            if(brand){
                const b = await Brand.findOne({
                    where: { 
                        nano_id: brand,
                        status: true,
                    }
                });
                if(!b){
                    throw new Error("Invalid Product Brand specified");
                }
                // if brand found with saved product and brand sent with payload, then upate
                if(product.ProductBrands.length > 0){
                    await  db.sequelize.query(
                        `UPDATE jt_brand_products SET brand_id = :brand_id WHERE product_id = :product_id`,
                        {
                            replacements: { brand_id: b.id, product_id: product.id },
                            type: QueryTypes.UPDATE, // Specify the query type
                            transaction: t,
                        }
                    );
                }else {
                    // no previous brand attached to product, then attach one now
                    await result.addProductBrand(b, { transaction: t });
                }
            }else {
                // delete previous attached brand if available
                await db.sequelize.query(
                    `DELETE jbp FROM jt_brand_products as jbp WHERE jbp.product_id = :product_id`,
                    {
                        replacements: { product_id: product.id },
                        type: QueryTypes.DELETE,
                        transaction: t,
                    }
                );
            }
            
            if(expDate){
                // if expDAte found with saved product and expDate sent with payload, then upate
                if(product.ProductExpDate){
                    const d = format(expDate, "yyyy-MM-dd");
                    await  db.sequelize.query(
                        `UPDATE product_exp_dates SET date = :date WHERE product_id = :product_id`,
                        {
                            replacements: { date: d, product_id: product.id },
                            type: QueryTypes.UPDATE, // Specify the query type
                            transaction: t,
                        }
                    );
                }else {
                    // insert new date
                    const date = format(expDate, "yyyy-MM-dd");
                    await ProductExpDate.create({ product_id: product.id, date }, { transaction: t });
                }
            }else {
                // delete previous attached date if available
                await db.sequelize.query(
                    `DELETE ped FROM product_exp_dates as ped WHERE ped.product_id = :product_id`,
                    {
                        replacements: { product_id: product.id },
                        type: QueryTypes.DELETE,
                        transaction: t,
                    }
                );
            }
            
            if(barcode && barcode.length > 0){
                // if expDAte found with saved product and expDate sent with payload, then upate
                if(product.ProductBarcode){
                    await  db.sequelize.query(
                        `UPDATE product_barcodes SET code = :barcode WHERE product_id = :product_id`,
                        {
                            replacements: { barcode, product_id: product.id },
                            type: QueryTypes.UPDATE, // Specify the query type
                            transaction: t,
                        }
                    );
                }else {
                    // insert new barcode
                    await Barcode.create({ product_id: product.id, code: barcode }, { transaction: t });
                }
            }else {
                // delete previous attached barcode if available
                await db.sequelize.query(
                    `DELETE pb FROM product_barcodes as pb WHERE pb.product_id = :product_id`,
                    {
                        replacements: { product_id: product.id },
                        type: QueryTypes.DELETE,
                        transaction: t,
                    }
                );
            }
            return product;
        });
    } catch (error) {
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different value");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const findAllActive = async () => {
    return await Product.findAll({
        where: { status: true },
        attributes: {
            exclude: ['id', 'nano_id', 'tract_id'],
            include: [['nano_id', 'product_id'], 'name', 'sales_price'],
        },
        include: [
            {
                model: Tract,
                attributes: {
                    exclude: ['id', 'nano_id'],
                    include: [["nano_id", 'id'], 'name'],
                },
            },
            {
                model: Barcode,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: ProductExpDate,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: Brand,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            },
            {
                model: Category,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            }
        ],
    });
}

const search = async (prop) => {
    const { str, status } = prop;
    const s = JSON.parse(status);

    const products = await Product.findAll({
        where: { 
            status: s,
            name: {
                [Op.like]: `%${str != undefined ? str : ''}%`,
            }
        },
        attributes: {
            exclude: ['id', 'nano_id', 'tract_id'],
            include: [['nano_id', 'product_id'], 'name', 'sales_price'],
        },
        include: [
            {
                model: Tract,
                attributes: {
                    exclude: ['id', 'nano_id'],
                    include: [["nano_id", 'id'], 'name'],
                },
            },
            {
                model: Barcode,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: ProductExpDate,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: Brand,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            },
            {
                model: Category,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            }
        ],
    });
    return products;
}

const paginateFetch = async (prop) => {
    // page: Current page number (e.g., 1-indexed), pageSize: Number of items per page
    const {page, pageSize, status} = prop; 

    let size = pageSize * 1;    // convert to number
    const offset = (page - 1) * size;
    const s = JSON.parse(status);

    const { count, rows } = await Product.findAndCountAll({
        where: { status: s },
        attributes: {
            exclude: ['id', 'nano_id', 'tract_id'],
            include: [['nano_id', 'product_id'], 'name', 'sales_price'],
        },
        include: [
            {
                model: Tract,
                attributes: {
                    exclude: ['id', 'nano_id'],
                    include: [["nano_id", 'id'], 'name'],
                },
            },
            {
                model: Barcode,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: ProductExpDate,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: Brand,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            },
            {
                model: Category,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            }
        ],
        limit: size,
        offset: offset,
    });
    return {count, products: rows};
}

/*  method to initialize Product page with 100 active products to use as defaultOptions for AsyncSelect
    and also count total active products for pagination component */
const activeProductPageInit = async (pageSize) => {
    let size = pageSize * 1;    // convert to number
    const { count, rows } = await Product.findAndCountAll({
        where: { status: true },
        subQuery: false, // <-- Add this line
        attributes: {
            exclude: ['id', 'nano_id', 'tract_id'],
            include: [['nano_id', 'product_id'], 'name', 'sales_price'],
        },
        include: [
            {
                model: Tract,
                attributes: {
                    exclude: ['id', 'nano_id'],
                    include: [["nano_id", 'id'], 'name'],
                },
            },
            {
                model: Barcode,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: ProductExpDate,
                attributes: {
                    exclude: ['id', 'product_id'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
            },
            {
                model: Brand,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            },
            {
                model: Category,
                attributes: {
                    exclude: ['id', 'nano_id', 'name'],
                    include: [["nano_id", 'id'], 'name'],
                },
                required: false, // Force a LEFT OUTER JOIN (makes it optional)
                through: { attributes: [] }, // Optional: hides junction table metadata from payload
            }
        ],
        limit: size,
    });
    return {count, products: rows};
}

module.exports = {
    findByNanoId,
    createProduct,
    status,
    search,
    update,
    findAllActive,
    paginateFetch,
    activeProductPageInit,
}