const db = require('../config/entities-config');
const { Op } = require('sequelize');
const { nanoid } = require('nanoid');
const { format } = require('date-fns');

const User = db.users;
const Product = db.products;
const Brand = db.brands;
const Category = db.categories;
const Tract = db.tracts;
const ProductExpDate = db.expDate;

const findByNanoId = async (nano_id) => {
    return await Product.findOne({
        where: { nano_id },
        include: [
            {
                model: ProductExpDate,
                required: false // 'false' allows LEFT OUTER JOIN, making the associated data optional
            }
        ],
    });
}

const createProduct = async (creator_id, data) => {
    try {
        const { product_name, restock_level, expDate, sales_price, brand, category, tract } = data;
        return await db.sequelize.transaction( async (t) => {
            const dept = await Tract.findOne({
                where: { nano_id: tract }
            });
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
                    where: { nano_id: category }
                });
                await product.addProductCategory(c, { transaction: t });
            }
            
            if(brand){
                const b = await Brand.findOne({
                    where: { nano_id: brand }
                });
                await product.addProductBrand(b, { transaction: t });
            }
            
            if(expDate){
                const date = format(expDate, "yyyy-MM-dd");
                await ProductExpDate.create({ product_id: product.id, date }, { transaction: t });
            }
            return product;
        });
    } catch (error) {
        console.log(error);
        if(error.name === 'SequelizeUniqueConstraintError'){
            throw new Error(error.errors[0].value + " not available. Please use a different value");
        }
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
};

module.exports = {
    findByNanoId,
    createProduct,
}